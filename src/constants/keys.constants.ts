export const MouseKeyToValue = {
  0: "left",
  1: "middle",
  2: "right",
} as const

export type MouseBtnKeys = keyof typeof MouseKeyToValue
export type MouseBtnValuesTypes = (typeof MouseKeyToValue)[MouseBtnKeys]
