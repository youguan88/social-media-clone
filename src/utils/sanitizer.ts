import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';

const window = new JSDOM('').window;
const purify = createDOMPurify(window);

purify.setConfig({
  USE_PROFILES: { html: true },
});

export const sanitize = (dirty: string): string => {
  return purify.sanitize(dirty);
};
