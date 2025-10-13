import { CollisionDetection, Collision, closestCenter } from '@dnd-kit/core';

// Lightweight collision adapter: use elementFromPoint hit-testing to try and
// map the pointer coordinates to a droppable id. Return an array of Collision
// objects ({ id }). If no match found, return an empty array so the DnD kit
// can fall back to its default behavior.
export const elementFromPointCollision: CollisionDetection = (args) => {
  const { pointerCoordinates } = args;
  if (!pointerCoordinates) return closestCenter(args);

  try {
    const el = document.elementFromPoint(pointerCoordinates.x, pointerCoordinates.y) as HTMLElement | null;
    if (!el) return closestCenter(args);

    let node: HTMLElement | null = el;
    while (node) {
      // check common attributes used in this codebase
      const droppableId = node.getAttribute && node.getAttribute('data-droppable-id');
      const taskId = node.getAttribute && node.getAttribute('data-task-id');
      const id = droppableId || taskId;
      if (id) {
        const collision: Collision = { id } as Collision;
        return [collision];
      }
      node = node.parentElement;
    }
  } catch {
    // elementFromPoint may throw in unusual environments; fall through to fallback
  }

  // if no element matched, fall back to dnd-kit's default algorithm
  return closestCenter(args);
};

export default elementFromPointCollision;
