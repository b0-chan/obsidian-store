### повільна ініціалізація віджетів
#### Чому?
1. Кожен віджет вантажить собі ресурси окремо
	1. збільшується навантаження на чергу браузеру
	2. збільшується навантаження на сервер(и)
	3. через 1,2 збільшується час очікування відповіді клієнтом, відповідно збільшується відклик системи
2. Віджети надто великі, складні, не ефективні
#### що робити?
1. поставити когось перед віджетами, щоб він займався:
	1. кешуванням спільних частин
	2. дедуплікацією однакових запитів між віджетами, тобто аби N віджетів зробивши одночасно запит X - ініціювали 1 фактичний АПІ виклик
	3. 

### повільна робота з мережею в рантаймі
#### Чому?
1. Кожен віджет вантажить собі ресурси окремо
	1. збільшується навантаження на чергу браузеру
	2. збільшується навантаження на сервер(и)
	3. через 1,2 збільшується час очікування відповіді клієнтом, відповідно збільшується відклик системи
2. Віджет часто це - частина додатку упакована як окремий додаток
### повільний рендер/взаємодія з користувачем


#### Що кешувати?
1. `/api/tenants/serviceUrls?`
2. `api/security/acl/<userId>/effective/scaleunit`
3. `api/templates/1cb17221-7877-445c-8503-6395db4936d2/contents?settingsIds`
4. `/api/plans`
5.  `/api/v1.0/bootstrap`
6. `/api/rg/users`
7. `/api/v1.0/bootstrap/crm/metadata`
8. **?** `/api/v1.0/contactStatuses`
9. **?** `/api/v1.0/users/me`
10. **?** `/api/features/analytics`

Популярні віджети:
* /widgets/signals
* /widgets/salesforce/customImport
* /widgets/reports/forecast-table
* /widgets/team/forecast
* /widgets/reports/pipeline-evolution
* /widgets/opportunities
* /widgets/opportunity/:id/engagement
* /widgets/accounts/:id/engagement
* /widgets/accounts/:id/connections
* /widgets/accounts/:id
*  /widgets/salesforce/:id/mailto
* /widgets/person/:id/sequences
* /widgets/opportunity/activity
* widgets/person/:id/activity
* widgets/person/:id/overview

Приклад віджету person/sequences
1. до отримання хтмл 300ms
2. до старту завантаження бандлу 500ms
3. до старту завантаження сервіс урлів 700ms
4. завантаження сервіс урлів 500ms


Потік:
1. отримання сервіс урлів
2. отримання токену

Питання:
1. чи можемо ми кешувати сервіс урли, якщо так то наскільки?


| Step                                                         | Duration  | Start Time |
| ------------------------------------------------------------ | --------- | ---------- |
| Salesforce internal processing before canvas app call        | 4s        |            |
| Canvas app call                                              | 400ms     | 4s         |
| HTML loading                                                 | 400ms     | 4s         |
| Scripts loading (cache)                                      | 0.27ms    | 4.9s       |
| Service URLs loading                                         | 300ms     | 5.5s       |
| Exchange single-use token for access token                   | 300ms     | 5.9s       |
| Check credentials                                            | 1.4s      | 6.3s       |
| **Settings loading**                                         | ~3s       |            |
| - Feature flags, permissions, bootstrap, Salesforce metadata | ~3s       |            |
| - Widget-specific settings loading                           | 300ms     | 8.2s       |
| **Contact data loading**                                     |           |            |
| - Contact loading from drips                                 | 200ms     | 8.4s       |
| - Contact activity feed loading                              | 150-200ms | 8.6s       |
| - Contact activity feed loading                              | 150-200ms |            |
| - Contact activity feed loading                              | 150-200ms |            |
| - Engagement/GetTrackerEmailInteractions                     | 640ms     | 9.7s       |
| - Contact activity feed loading                              | 150-200ms |            |
| - Contact activity feed loading                              | 150-200ms | 10s        |

