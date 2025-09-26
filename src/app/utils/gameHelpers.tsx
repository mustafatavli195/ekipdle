import { JSX } from "react";

export const normalizeString = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i");

export const getArrow = (guessValue?: number, secretValue?: number) => {
  if (guessValue === undefined || secretValue === undefined) return undefined;
  if (guessValue === secretValue) return undefined;
  return guessValue > secretValue ? (
    <span className="text-blue-600 font-bold text-lg">⬇️</span>
  ) : (
    <span className="text-red-600 font-bold text-lg">⬆️</span>
  );
};

export const getInterestsStatus = (
  guessInterests: string[],
  secretInterests: string[]
) => {
  if (!guessInterests.length || !secretInterests.length) return "wrong";
  const common = guessInterests.filter((i) => secretInterests.includes(i));
  if (common.length === 0) return "wrong";
  if (
    common.length === secretInterests.length &&
    guessInterests.length === secretInterests.length
  )
    return "correct";
  return "partial";
};

export const renderBox = (
  label: string,
  value: string | number | JSX.Element,
  correct: boolean,
  arrow?: JSX.Element,
  customBg?: string
) => (
  <div className="flex flex-col items-center mx-1">
    <span className="text-xs text-purple-600 mb-1">{label}</span>
    <div
      className={`w-20 h-20 flex items-center justify-center text-center rounded-2xl font-bold transition-all duration-300 overflow-hidden text-sm shadow-md ${
        customBg ? customBg : correct ? "bg-green-200" : "bg-pink-200"
      }`}
    >
      {value} {arrow}
    </div>
  </div>
);
