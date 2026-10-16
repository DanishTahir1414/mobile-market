export const catalog: Record<string, { name: string; storage: number[] }[]> = {
  Apple: [
    { name: 'iPhone 15 Pro', storage: [128, 256, 512] },
    { name: 'iPhone 14 Pro', storage: [128, 256, 512] },
    { name: 'iPhone 13', storage: [128, 256] },
    { name: 'iPhone 12', storage: [64, 128, 256] },
  ],
  Samsung: [
    { name: 'Galaxy S24 Ultra', storage: [256, 512] },
    { name: 'Galaxy S23', storage: [128, 256] },
    { name: 'Galaxy A54', storage: [128, 256] },
  ],
  Google: [
    { name: 'Pixel 8 Pro', storage: [128, 256] },
    { name: 'Pixel 7', storage: [128, 256] },
  ],
  OnePlus: [{ name: 'OnePlus 12', storage: [256, 512] }],
  Xiaomi: [{ name: 'Redmi Note 13', storage: [128, 256] }],
  Oppo: [{ name: 'Reno 11', storage: [128, 256] }],
};
export const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Hyderabad', 'Faisalabad'];
