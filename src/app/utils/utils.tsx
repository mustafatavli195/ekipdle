// /app/utils.tsx
import { JSX } from "react";

export const normalizeString = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i");

export const getArrow = (
  guessValue?: number,
  secretValue?: number
): JSX.Element | undefined => {
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
