import { categories, type Category } from "@/lib/editorData";

interface Props {
  onSelect: (category: Category) => void;
}

const StepThemeSelection = ({ onSelect }: Props) => {
  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6 w-full max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-foreground text-center">
        選擇主題
      </h1>
      <p className="text-xl text-muted-foreground text-center">
        請選擇您想製作的祝福圖類型
      </p>
      <div className="flex flex-col gap-5 w-full">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat)}
            className={`flex items-center gap-5 w-full min-h-[90px] rounded-2xl border-4 ${cat.color} px-6 py-5 text-left transition-transform active:scale-95 hover:shadow-lg`}
          >
            <span className="text-5xl">{cat.icon}</span>
            <div>
              <p className="text-2xl font-bold text-foreground">{cat.name}</p>
              <p className="text-lg text-muted-foreground">{cat.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StepThemeSelection;
