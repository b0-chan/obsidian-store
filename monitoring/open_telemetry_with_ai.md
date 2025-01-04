
## Goals

- **Enhance Modularity**: Ensure each component has a clear responsibility.
- **Reduce Duplication**: Consolidate common functionality.
- **Improve Maintainability**: Make the code easier to extend and debug.
- **Leverage Abstractions**: Use interfaces and factories for better structure.

---

## Implementation Details

### 1. Base Exporter Interface

A shared interface for exporters that ensures consistent behavior across different types.

```typescript
// src/interfaces/BaseExporter.ts
export interface BaseExporter {
  shutdown(): Promise<void>;
}
```

### 2. Specialized Exporter Interfaces

Each telemetry type extends the `BaseExporter` and provides specific export functionality.

```typescript
// src/interfaces/TracerExporter.ts
import { BaseExporter } from './BaseExporter';
import { ReadableSpan, ExportResult } from '@opentelemetry/sdk-trace-base';

export interface TracerExporter extends BaseExporter {
  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): void;
}

// src/interfaces/MetricsExporter.ts
import { BaseExporter } from './BaseExporter';

export interface MetricsExporter extends BaseExporter {
  exportMetric(name: string, value: number, properties?: Record<string, any>): void;
}

// src/interfaces/LogExporter.ts
import { BaseExporter } from './BaseExporter';

export interface LogExporter extends BaseExporter {
  exportLog(level: 'info' | 'warning' | 'error', message: string, properties?: Record<string, any>): void;
}
```

### 3. Exporter Factory

A centralized factory for creating application insights exporters.

```typescript
// src/exporters/AppInsightsExporterFactory.ts
import { TracerExporter } from '../interfaces/TracerExporter';
import { MetricsExporter } from '../interfaces/MetricsExporter';
import { LogExporter } from '../interfaces/LogExporter';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

export const createAppInsightsExporter = (appInsights: ApplicationInsights) => ({
  createTracerExporter(): TracerExporter {
    return {
      export(spans, resultCallback) {
        try {
          spans.forEach((span) => {
            appInsights.trackTrace({
              message: span.name,
              severityLevel: 1,
              properties: {
                id: span.spanContext().spanId,
                traceId: span.spanContext().traceId,
                attributes: span.attributes,
                duration: span.duration[0] / 1e6,
              },
            });
          });
          resultCallback({ code: ExportResultCode.SUCCESS });
        } catch (error) {
          console.error('Error exporting spans:', error);
          resultCallback({ code: ExportResultCode.FAILED });
        }
      },
      shutdown: async () => {},
    };
  },

  createMetricsExporter(): MetricsExporter {
    return {
      exportMetric(name, value, properties = {}) {
        appInsights.trackMetric({ name, average: value, properties });
      },
      shutdown: async () => {},
    };
  },

  createLogExporter(): LogExporter {
    return {
      exportLog(level, message, properties = {}) {
        appInsights.trackTrace({
          message,
          severityLevel: level === 'error' ? 3 : level === 'warning' ? 2 : 1,
          properties,
        });
      },
      shutdown: async () => {},
    };
  },
});
```

### 4. Telemetry Services

Each telemetry type has its own service for encapsulating domain-specific logic.

#### TelemetryModule Interface

Define an interface that bridges the gap between OpenTelemetry and Application Insights.

```typescript
// src/interfaces/TelemetryModule.ts
import { ILogger } from './ILogger';
import { Tracer } from '@opentelemetry/api';

export interface TelemetryModule {
  logger: ILogger;
  tracer: Tracer;
  trackMetric(name: string, value: number, properties?: Record<string, any>): void;
  trackEvent(name: string, properties?: Record<string, any>): void;
  trackException(error: Error, properties?: Record<string, any>): void;
  shutdown(): Promise<void>;
}
```

#### ILogger Interface

Define a unified interface for logging functionality with methods similar to Application Insights.

```typescript
// src/interfaces/ILogger.ts
export interface ILogger {
  trackEvent(name: string, properties?: Record<string, any>): void;
  trackException(error: Error, properties?: Record<string, any>): void;
  trackMetric(name: string, value: number, properties?: Record<string, any>): void;
  trackTrace(message: string, severityLevel: 0 | 1 | 2 | 3 | 4, properties?: Record<string, any>): void;
}
```

#### Tracer Service

Handles span creation, lifecycle management, and event recording.

```typescript
// src/services/TracerService.ts
import { TracerExporter } from '../interfaces/TracerExporter';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { Span, Tracer } from '@opentelemetry/api';

export const createTracerService = (exporter: TracerExporter) => {
  const provider = new WebTracerProvider();
  provider.addSpanProcessor(new BatchSpanProcessor(exporter));
  provider.register({ contextManager: new ZoneContextManager() });
  const tracer: Tracer = provider.getTracer('tracer-service');

  return {
    startSpan(name: string, attributes: Record<string, any> = {}): Span {
      const span = tracer.startSpan(name);
      Object.entries(attributes).forEach(([key, value]) => {
        span.setAttribute(key, value);
      });
      return span;
    },

    endSpan(span: Span): void {
      span?.end();
    },

    recordEvent(span: Span, eventName: string, attributes: Record<string, any> = {}): void {
      span?.addEvent(eventName, attributes);
    },
  };
};
```

#### Web Vitals Module

Move web vitals tracking logic to a separate module.

```typescript
// src/modules/WebVitals.ts
import { onCLS, onFID, onLCP, onTTFB, onINP } from 'web-vitals';
import { MetricsExporter } from '../interfaces/MetricsExporter';

export const initWebVitals = (exporter: MetricsExporter) => {
  const recordMetric = (name: string, value: number) => {
    exporter.exportMetric(name, value);
  };

  onCLS((metric) => recordMetric('CLS', metric.value));
  onFID((metric) => recordMetric('FID', metric.value));
  onLCP((metric) => recordMetric('LCP', metric.value));
  onTTFB((metric) => recordMetric('TTFB', metric.value));
  onINP((metric) => recordMetric('INP', metric.value));
};
```

### 5. Telemetry Module

Refactor the telemetry module to use Dependency Injection (DI) for better modularity and flexibility. This approach allows components to be dynamically injected, enhancing testability and scalability.

```typescript
// src/index.ts
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { createAppInsightsExporter } from './exporters/AppInsightsExporterFactory';
import { createTracerService } from './services/TracerService';
import { initWebVitals } from './modules/WebVitals';
import { TelemetryModule } from './interfaces/TelemetryModule';

export const createTelemetryModule = ({
  appInsights,
  tracerExporter,
  metricsExporter,
  logger,
}: {
  appInsights: ApplicationInsights;
  tracerExporter: ReturnType<typeof createAppInsightsExporter>['createTracerExporter'];
  metricsExporter: ReturnType<typeof createAppInsightsExporter>['createMetricsExporter'];
  logger: TelemetryModule['logger'];
}): TelemetryModule => {
  const tracer = createTracerService(tracerExporter).tracer;

  return {
    logger,
    tracer,
    trackMetric: (name, value, properties) => metricsExporter.exportMetric(name, value, properties),
    trackEvent: (name, properties) => logger.trackEvent(name, properties),
    trackException: (error, properties) => logger.trackException(error, properties),
    shutdown: async () => {
      await tracerExporter.shutdown();
      await metricsExporter.shutdown();
      await logger.shutdown?.();
    },
  };
};
```

---

## Benefits of the Refactor

1. **Modularity**: Each service and exporter has a single responsibility.
2. **Reusability**: Factories enable consistent creation of components.
3. **Scalability**: Adding new exporters or telemetry types is straightforward.
4. **Maintainability**: Clear separation of concerns simplifies debugging and extending functionality.