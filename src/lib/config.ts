import "dotenv/config";
export const config = {
  appUrl: process.env.APP_URL || "http://localhost:3000",
  dbUrl: process.env.DATABASE_URL!,
  redisUrl: process.env.REDIS_URL!,
  openaiKey: process.env.OPENAI_API_KEY!,
  openaiModel: process.env.OPENAI_MODEL || "gpt-5-mini",
  falKey: process.env.FAL_KEY!,
  falFluxModel: process.env.FAL_FLUX_MODEL || "flux-pro",
  freeWatermarkText: process.env.FREE_WATERMARK_TEXT || "Made with Vissocial",
  freeCaptionFooter: process.env.FREE_CAPTION_FOOTER || "—\nMade with @vissocial\n#vissocial #aicontent"
};
