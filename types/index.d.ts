// the chosen ninja's roster id, like 'kakashi'
export type Hero = string

declare module 'claude-code' {
  interface PluginState {
    naruto: {
      hero: Hero
    }
  }
}
