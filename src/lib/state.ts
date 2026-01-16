export const ProjectStates = {
  created: "created",
  instagram_connected: "instagram_connected",
  importing_media: "importing_media",
  detecting_products: "detecting_products",
  awaiting_product_confirmation: "awaiting_product_confirmation",
  ready_for_plan: "ready_for_plan",
  generating_plan: "generating_plan",
  ready_to_review: "ready_to_review"
} as const;

export type ProjectState = typeof ProjectStates[keyof typeof ProjectStates];
