declare module "*.png";
declare module "*.jpeg";
declare module "*.jpg";

declare module "*.svg" {
    import type React from "react"
    import type { SvgProps } from "react-native-svg"
    const content: React.FC<SvgProps>
    export default content
  }
  