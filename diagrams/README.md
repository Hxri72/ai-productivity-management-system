# UML Diagrams — TaskFlow AI

## Structure

```
diagrams/
├── png/            # Rendered PNG exports (use in reports)
└── source-md/      # Mermaid source files (editable)
```

## Diagram Index

| # | File | Type | Description |
|---|------|------|-------------|
| 01 | `activity_authentication_flow.png` | Activity | Login/register flow |
| 02 | `activity_task_management_flow.png` | Activity | Task CRUD operations |
| 03 | `activity_ai_prioritization_flow.png` | Activity | AI scoring with fallback |
| 04 | `activity_analytics_pipeline.png` | Activity | Analytics data loading |
| 05 | `class_diagram.png` | Class | Models, services, enums, relationships |
| 06 | `er_diagram.png` | ER | Database entities and relationships |
| 07 | `use_case_diagram.png` | Use Case | 28 use cases across all modules |
| 08 | `sequence_registration_login.png` | Sequence | Full auth flow (client to DB) |
| 09 | `sequence_token_refresh.png` | Sequence | Automatic JWT refresh |
| 10 | `sequence_create_task.png` | Sequence | Task creation with activity logging |
| 11 | `sequence_ai_prioritization.png` | Sequence | AI scoring with OpenAI/fallback |
| 12 | `sequence_analytics_loading.png` | Sequence | Parallel analytics API calls |
| 13 | `sequence_deadline_notification.png` | Sequence | Deadline check and alerts |
| 14 | `component_system_architecture.png` | Component | 3-tier architecture overview |
| 15 | `component_frontend_hierarchy.png` | Component | React component tree |
| 16 | `component_backend_pipeline.png` | Component | Express request pipeline |
| 17 | `deployment_diagram.png` | Deployment | Server topology |
| 18 | `technology_stack.png` | Mindmap | Full tech stack visualization |
| 19 | `dfd_level0_context.png` | DFD | Context diagram |
| 20 | `dfd_level1_system_processes.png` | DFD | System-level processes |
| 21 | `dfd_level2_task_management.png` | DFD | Task management detail |

## Editing Diagrams

1. Edit the `.md` file in `source-md/`
2. Re-render using mermaid-cli:
   ```bash
   mmdc -i source.mmd -o output.png -b white -s 3 -p puppeteer-config.json
   ```
3. Or preview in VS Code with the Mermaid Preview extension
