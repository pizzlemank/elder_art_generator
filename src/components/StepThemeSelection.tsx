import { type Category } from "@/lib/editorData";
import { useCategories } from "@/hooks/useEditorData";

interface Props {
  onSelect: (category: Category) => void;
}

const StepThemeSelection = ({ onSelect }: Props) => {
  const categories = useCategories();

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6 w-full max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground text-center">選主題</h1>
      <p className="text-xl text-muted-foreground text-center">先挑一個主題，接著選背景再加文字。</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat)}
            className={`flex items-center gap-4 w-full min-h-[110px] rounded-2xl border-4 ${cat.color} px-5 py-4 text-left transition-transform active:scale-95 hover:shadow-lg`}
          >
            <div
              className="h-20 w-20 rounded-xl border-2 border-white/60 bg-card shadow-sm flex items-center justify-center text-3xl"
              style={
                cat.featuredImage
                  ? {
                      backgroundImage: `url(${cat.featuredImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              {!cat.featuredImage && <span>{cat.icon}</span>}
            </div>
            <div className="flex-1">
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
