import type { CSSProperties } from 'react';

export const blueprintStyleCyan: CSSProperties = {
    backgroundImage: `
        linear-gradient(rgba(0, 128, 255, 0.2) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 128, 255, 0.2) 1px, transparent 1px)
    `,
    backgroundSize: '20px 20px',
};

export const blueprintStyleFuchsia: CSSProperties = {
    backgroundImage: `linear-gradient(rgba(255, 0, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 0, 255, 0.1) 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
};

export const blueprintStyleAdmin: CSSProperties = {
    backgroundImage: `
        linear-gradient(rgba(0, 128, 255, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 128, 255, 0.1) 1px, transparent 1px)
    `,
    backgroundSize: '20px 20px',
};

export const blueprintStyleAdminLogin: CSSProperties = {
    backgroundImage: `
        linear-gradient(rgba(128, 128, 128, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(128, 128, 128, 0.1) 1px, transparent 1px)
    `,
    backgroundSize: '20px 20px',
};
