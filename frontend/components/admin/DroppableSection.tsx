import { useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

interface DroppableSectionProps {
  sectionId: string;
  dockId: string;
  acceptTypes: string[];
  children: ReactNode;
}

const DroppableSection = ({
  sectionId,
  dockId,
  acceptTypes,
  children,
}: DroppableSectionProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: sectionId,
    data: {
      type: "dock-section",
      dockId,
      acceptTypes,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        relative min-h-[60px]
        ${
          isOver
            ? "bg-success/10 rounded-lg border-2 border-success border-dashed"
            : ""
        }
        transition-all duration-200
      `}
    >
      {children}

      {/* Visual feedback untuk empty section */}
      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-success/20 rounded-lg p-2">
            <span className="text-success font-medium text-sm">
              Pindahkan ke sini
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DroppableSection;
