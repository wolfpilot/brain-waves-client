export const TOOLBAR_TOOLS = {
  select: "Select",
  rectangle: "Rectangle",
  circle: "Circle",
} as const

export const TOOLBAR_CONTROLS = {
  reset: "Reset Canvas",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
} as const

export type ToolKeys = keyof typeof TOOLBAR_TOOLS
export type ToolValueTypes = (typeof TOOLBAR_TOOLS)[ToolKeys]

export type ControlKeys = keyof typeof TOOLBAR_CONTROLS
export type ControlValueTypes = (typeof TOOLBAR_CONTROLS)[ControlKeys]
