import { Progress } from "@/components/ui/progress";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  label: string;
}

const StepProgress = ({ currentStep, totalSteps, label }: StepProgressProps) => {
  const percent = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full px-4 py-3">
      <p className="text-center text-xl font-bold text-foreground mb-2">
        步驟 {currentStep}/{totalSteps}：{label}
      </p>
      <Progress value={percent} className="h-4" />
    </div>
  );
};

export default StepProgress;
