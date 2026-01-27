# Spec-Driven Development (SDD) Workflow

To ensure high quality and alignment with business goals, this project follows a Spec-Driven Development cycle.

---

## 1. Specification (Phase 1)
No code should be written before the specification is defined and approved.
- All functional requirements go into `specs/product/`.
- Technical designs, data schemas, and business logic go into `specs/tech/`.
- UI/UX flows and component behaviors go into `specs/ui/`.

## 2. Implementation (Phase 2)
The AI agent (Antigravity) uses the specs as the absolute "Source of Truth".
- Implementation must follow the technical architecture.
- Any discrepancy found during implementation must lead to a spec update *before* continuing the code change.

## 3. Validation (Phase 3)
- Unit and integration tests must validate the logic defined in the specs.
- The UI must match the defined user flows and component specs.

## 4. Bug Management (Spec Discrepancy)
Un bug se define como cualquier comportamiento del código que no coincida con lo definido en `/specs`.
- **Procedimiento**:
    1. Crear un archivo en `specs/bugs/BUG-[nombre].md`.
    2. Documentar la brecha entre la especificación y la implementación actual.
    3. Una vez corregido, el spec de la corrección se marca como resuelto.
- **Regla**: Prohibido "corregir" código cambiando la lógica de negocio sin antes haber validado si la **Spec** original era correcta o si debe ser actualizada.
- `/specs/product/`: Why and What.
- `/specs/tech/`: How.
- `/specs/ui/`: Visuals and Interactions.
- `/specs/features/`: Temporary folder for active/new feature development before merging into core specs.

---

## Rule for Agents
If a user request conflicts with the specifications, the agent must:
1.  Point out the conflict.
2.  Ask if the spec should be updated.
3.  Implement only after the spec is aligned.
