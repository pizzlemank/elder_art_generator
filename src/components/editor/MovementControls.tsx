import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Trash2 } from "lucide-react";

const MOVE_STEP = 20;

interface Props {
  onMove: (dx: number, dy: number) => void;
  onDelete: () => void;
}

const MovementControls = ({ onMove, onDelete }: Props) => (
  <div className="w-full">
    <p className="text-lg font-bold text-foreground mb-2">移動文字：</p>
    <div className="grid grid-cols-3 gap-2 w-[220px] mx-auto">
      <div />
      <Button variant="secondary" className="min-h-[60px] text-2xl" onClick={() => onMove(0, -MOVE_STEP)}>
        <ArrowUp size={32} />
      </Button>
      <div />
      <Button variant="secondary" className="min-h-[60px] text-2xl" onClick={() => onMove(-MOVE_STEP, 0)}>
        <ArrowLeft size={32} />
      </Button>
      <Button variant="destructive" className="min-h-[60px] text-xl" onClick={onDelete}>
        <Trash2 size={28} />
      </Button>
      <Button variant="secondary" className="min-h-[60px] text-2xl" onClick={() => onMove(MOVE_STEP, 0)}>
        <ArrowRight size={32} />
      </Button>
      <div />
      <Button variant="secondary" className="min-h-[60px] text-2xl" onClick={() => onMove(0, MOVE_STEP)}>
        <ArrowDown size={32} />
      </Button>
      <div />
    </div>
  </div>
);

export default MovementControls;
