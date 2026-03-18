import { useState, useEffect } from "react";
import {
  type Category,
  type Background,
  loadCategories,
  loadBackgrounds,
  loadPhrases,
} from "@/lib/editorData";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    loadCategories().then(setCategories);
  }, []);
  return categories;
}

export function useBackgrounds() {
  const [backgrounds, setBackgrounds] = useState<Record<string, Background[]>>({});
  useEffect(() => {
    loadBackgrounds().then(setBackgrounds);
  }, []);
  return backgrounds;
}

export function usePhrases() {
  const [phrases, setPhrases] = useState<Record<string, string[]>>({});
  useEffect(() => {
    loadPhrases().then(setPhrases);
  }, []);
  return phrases;
}
