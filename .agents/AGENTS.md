# Project Rules & Customizations

## Obsidian Vault Integration Rules
1. **Поиск информации:** При выполнении инженерных расчетов или написании кода агент должен сканировать локальную директорию `knowledge_vault/` на предмет файлов с описанием методик, формул или требований к коду.
2. **Фиксация результатов и Архитектура (Вторая память):** По завершении сложной задачи агент должен сам генерировать резюме в формате Markdown и сохранять его в `knowledge_vault/Отчеты/` или `knowledge_vault/Справочники/`. Все архитектурные решения и новые "навыки" агента сохраняются здесь для сохранения контекста между сессиями.
3. **Расширение базы данных приложения:** Для добавления новых элементов данных (например, труб, стандартов, технологических жидкостей), которые должно считывать приложение OmniLab, агент должен создавать `.md` файлы в директории `knowledge_vault/База_данных/`.
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

## Git Workflow & Push Restriction Rule
1. **Запрет на автоматический Push:** Агенту строго запрещено выполнять команду `git push` без прямого запроса или явного согласия пользователя. Все изменения коммитятся или сохраняются локально. Отправка изменений в удаленный репозиторий выполняется только когда пользователь напишет команду об отправке (например, "Обнови на Гитхаб").
