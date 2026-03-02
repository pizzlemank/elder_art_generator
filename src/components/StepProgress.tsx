import { Progress } from "@/components/ui/progress";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

const StepProgress = ({ currentStep, totalSteps }: StepProgressProps) => {
  const percent = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full px-4 py-3">
      <p className="text-center text-xl font-bold text-foreground mb-2">
        步驟 {currentStep}/{totalSteps}
      </p>
      <Progress value={percent} className="h-4" />
    </div>
  );
};

export default StepProgress;
