# Project Rules & Customizations

> [!CAUTION]
> **КРИТИЧЕСКОЕ ПРАВИЛО: ЗАПРЕТ НА АВТОМАТИЧЕСКИЙ PUSH**
> Агенту категорически запрещено самостоятельно выполнять команду `git push` без прямого текстового запроса или явного согласия пользователя. Все изменения сохраняются и коммитятся исключительно локально. Отправка изменений в удаленный репозиторий выполняется только когда пользователь напишет команду об отправке (например, "Обнови на Гитхаб").

## Obsidian Vault Integration Rules
1. **Поиск информации:** При выполнении инженерных расчетов или написании кода агент должен сканировать локальную директорию `HADALBORE_LAB/` на предмет файлов с описанием методик, формул или требований к коду.
2. **Фиксация результатов и Архитектура (Вторая память):** По завершении сложной задачи агент должен сам генерировать резюме в формате Markdown и сохранять его в `HADALBORE_LAB/Отчеты/` или `HADALBORE_LAB/Справочники/`. Все архитектурные решения и новые "навыки" агента сохраняются здесь для сохранения контекста между сессиями.
3. **Расширение базы данных приложения:** Для добавления новых элементов данных (например, труб, стандартов, технологических жидкостей), которые должно считывать приложение OmniLab, агент должен создавать `.md` файлы в директории `HADALBORE_LAB/База_данных/`.
   - Файл ДОЛЖЕН содержать YAML frontmatter (блок между `---`), в котором указаны все поля (например, `type: "tubulars"`, `outer_diameter: 114.3`).
   - Тело файла может содержать расширенное текстовое описание, формулы или графики, которые будут отображаться в карточке элемента в приложении.
   - Пример структуры:
     ```yaml
     ---
     type: wellbore_fluids
     id: mud_polymeric_custom
     name: Полимерный буровой раствор (Custom)
     density: 1.15
     base: Водная
     system: Полимерная
     ---
     # Описание
     ...
     ```

## Product Boundary Standard V1

### Purpose
Prevent AI agents from incorrectly merging separate products into a single hierarchy.
This rule applies to every repository, website, application, and future project.

### Product Independence Rule
If two products have:
* different roadmaps
* different release cycles
* different positioning
* different target users
* different repositories (optional)

they must be treated as independent products. They must NOT be described as:
* module
* subsystem
* extension
* component
* feature
* plugin
unless explicitly defined by project documentation.

### Allowed Relationships
#### Independent Products
Example:
- `HADALBORE`
- `HADALBORE_LAB`

Relationship: **Company Portfolio** or **Product Ecosystem** (not Parent → Child)

#### Parent Product + Module
Only allowed when explicitly documented.
Example:
- `HADALBORE`
  └── Torque & Drag Module
  └── Reporting Module
  └── Data Import Module

### AI Agent Behavior
When analyzing a repository:
1. Never assume hierarchy.
2. Never infer module relationships from names.
3. Never infer ownership from branding similarity.
4. Verify relationship from documentation.
5. If relationship is unclear, use: **"Related Product"** instead of "Module" or "Subsystem".

### Default Classification
Unknown relationship: Product A ↔ Product B
Status: **Related Products** (until documentation proves otherwise).

### Examples
- **Correct**: `HADALBORE` = Core Product, `HADALBORE_LAB` = Independent Beta Product
- **Incorrect**: `HADALBORE_LAB` = HADALBORE Module/Subsystem/Feature

## Engineering Skills Orchestration Framework
При реализации расчетного кода или изменении базы данных в OmniLab агент обязан пропускать задачу через единую последовательную цепочку перекрестных проверок всех инженерных навыков:
1. **Металлургия (`hadalbore-metallurgy-corrosion-expert`)**:
   - Сверить классы прочности стали и расчетные YS.
   - Проверить среду: если присутствует H2S ($p_{\text{H2S}} \ge 0.05$ psi), заблокировать применение марок P110/Q125 и форсировать проверку лимита твердости $\le 22$ HRC (марки L80/C90/T95).
   - Проверить коэффициенты запаса прочности (Burst, Collapse, Tension, Von Mises).
2. **Резьбовые соединения (`hadalbore-thread-connection-expert`)**:
   - Сопоставить типы резьбы (совместимость и необходимость переводников).
   - Подтвердить границы моментов Torque-Turn с учетом металлургических лимитов трубы.
3. **Гидравлика и Нагрузки (`hadalbore-baker-hydraulics-expert`)**:
   - Рассчитать гидравлические силы поршня и нагрузки на крюк по правилам округлений Baker Hughes.
   - Провести расчет перемещений и дополнительных осевых сил НКТ при температурных и HPHT перепадах давления (уравнения Любинского).
4. **Конвертация величин (`scientific-unit-conversion`)**:
   - Гарантировать, что расчетный модуль работает строго в СИ, а конвертация в имперские/промысловые единицы выполняется исключительно на границах ввода/вывода.
5. **Архитектурный и переводной комплаенс (`hadalbore-architecture-compliance-guard` и `localization-compliance-auditor`)**:
   - Убедиться, что расчет изолирован в чистые JS-функции без DOM/UI-зависимостей.
   - Гарантировать отсутствие NaN/Infinity и безопасную обработку математических ошибок.
   - Проверить переводы и отсутствие хардкода строк в en/ru JSON с поддержкой плейсхолдеров.

## Interaction & Auto-learning Guidelines
1. **Предварительное информирование:** Перед выполнением любого действия или запуском команды агент обязан коротко написать пользователю, что именно он собирается сделать.
2. **Простой стиль общения без «воды»:** Отвечать лаконично, прямо по делу, как простому человеку, избегая шаблонов и лишних рассуждений.
3. **Автоматическое обучение навыков:** Все навыки (skills) должны иметь механизмы для автоматического самообучения и адаптации (запись новых формул, констант и прецедентов в свои файлы и базу знаний Obsidian).
