declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module 'ext-name';

declare module 'lodash';

declare module 'react-router-hash-link';

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare module 'turndown' {
  type TurndownFilter = string | string[] | ((node: Node, options: unknown) => boolean);
  type TurndownReplacement = (content: string, node: Node) => string;
  export default class TurndownService {
    constructor(options?: Record<string, unknown>);
    addRule(name: string, rule: { filter: TurndownFilter; replacement: TurndownReplacement }): this;
    turndown(html: string | HTMLElement): string;
  }
}
