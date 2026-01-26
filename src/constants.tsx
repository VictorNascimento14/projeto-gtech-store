
import { Product, Collection } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "K-Swiss V8 - Masculino",
    category: "Tênis",
    price: 100,
    originalPrice: 200,
    discount: "30% OFF",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBAiKDAo_-meifwjMo62TERQRYtAZG_qFOzYpJLsh04psDqmyb8oo9brE8kHkZs6Qv54h0w2E9QP2u1VynEs_swtPa0cBZSwLELvo_mtyeU1bfjEIBD4kGERlb0D5UUZhfBaq67efkb6dUddS-3cw1v3yjUFg5i7Qh5YRejIWVKIafU3L5BG9N5k49tUIZprh6R3_W9VdXQyfH9iE8vaUQGE4PTKaKg4ntT8cOkSNWJMhRQ5ABMrnvjpxihYE3gII3FqgswPlTHBP4",
    availableSizes: ['39', '40', '41', '42'],
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBAiKDAo_-meifwjMo62TERQRYtAZG_qFOzYpJLsh04psDqmyb8oo9brE8kHkZs6Qv54h0w2E9QP2u1VynEs_swtPa0cBZSwLELvo_mtyeU1bfjEIBD4kGERlb0D5UUZhfBaq67efkb6dUddS-3cw1v3yjUFg5i7Qh5YRejIWVKIafU3L5BG9N5k49tUIZprh6R3_W9VdXQyfH9iE8vaUQGE4PTKaKg4ntT8cOkSNWJMhRQ5ABMrnvjpxihYE3gII3FqgswPlTHBP4",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDGa_Oovzx3d_-nzNXp7yPBAZ1jbIRMFxvwYrUEp9GPQ95Sqq3JjhoKvlBQ2jo4kYpNCRIa4Aoy7BK-uC3IU9kBRo8g-wVrObnnguw6DtNE8Hjcp0m8jjsVAkGNqgEyq7TNBRxxx1uYQkrV9KTTCib3UrVtGkpStPecZWvYRFI2pvm-7-QF67KhjfF-zWfC23GTXSbSACt_pMBM9kav1HgQyQnKvtE9MBeaBcc0ARCwvrAcKQNHc62AJqh_U4JsNIc2ItauB-l7dIo"
    ],
    description: "Tênis clássico de alta durabilidade, perfeito para o dia a dia com um toque de elegância esportiva."
  },
  {
    id: 2,
    name: "Nike Air Zoom - Performance",
    category: "Tênis",
    price: 450,
    originalPrice: 600,
    discount: "25% OFF",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGa_Oovzx3d_-nzNXp7yPBAZ1jbIRMFxvwYrUEp9GPQ95Sqq3JjhoKvlBQ2jo4kYpNCRIa4Aoy7BK-uC3IU9kBRo8g-wVrObnnguw6DtNE8Hjcp0m8jjsVAkGNqgEyq7TNBRxxx1uYQkrV9KTTCib3UrVtGkpStPecZWvYRFI2pvm-7-QF67KhjfF-zWfC23GTXSbSACt_pMBM9kav1HgQyQnKvtE9MBeaBcc0ARCwvrAcKQNHc62AJqh_U4JsNIc2ItauB-l7dIo",
    availableSizes: ['37', '38', '43'],
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDGa_Oovzx3d_-nzNXp7yPBAZ1jbIRMFxvwYrUEp9GPQ95Sqq3JjhoKvlBQ2jo4kYpNCRIa4Aoy7BK-uC3IU9kBRo8g-wVrObnnguw6DtNE8Hjcp0m8jjsVAkGNqgEyq7TNBRxxx1uYQkrV9KTTCib3UrVtGkpStPecZWvYRFI2pvm-7-QF67KhjfF-zWfC23GTXSbSACt_pMBM9kav1HgQyQnKvtE9MBeaBcc0ARCwvrAcKQNHc62AJqh_U4JsNIc2ItauB-l7dIo"
    ],
    description: "Tecnologia de ponta em amortecimento para atletas que não abrem mão de performance e estilo."
  },
  {
    id: 3,
    name: "Camiseta Streetwear Oversized",
    category: "Camisetas",
    price: 89,
    originalPrice: 120,
    discount: "",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLZ99kaZmHfxrXpfJn3AOiwyd_R5iPBDzmSTaYSy-3p6NOFuXY_pMeV05rL95sUd8EGbvU3w2h_ABZDkJdo5QTdAD2jKgJkKG-y2XWQvBjpPmCb6ipXCl5UtoNpTO9m9jh0QhDzCiBokrF0_z9lqk9kZxglJjEIxRyYI-KcFIlbAdvxWHdL5hCbLNIT40nsx-sYXMVOBabYS-JAaKyp-t_jCleijH3tVPfedr09zd1Sxhc45-8DtvPd6kONYm2poRSjEgorewWwcQ",
    description: "Corte moderno e tecido premium para um visual urbano autêntico e confortável."
  },
  {
    id: 4,
    name: "Fone Bluetooth Bass Pro",
    category: "Headphones",
    price: 299,
    originalPrice: 399,
    discount: "",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYgb6P9bQ4v43KFi7dV6bgsssQHJ2BFoDgMErPMe2rk4dO0vJg4akGsPTpEHNsXAglHxOszOYruTOuirRSaeFkYfdVBLNCdw1WqAwvosYzGqPUBX3Q8Ai1v6xmLQ6peahjWT8Uld1rgjb1EeITnpiX0c70eLVwiW3pb5FyNGvpzeUP7PhUMbMkBsfvpT55-RLNHZkb1IrbJHiTQLok5d4tvOz2K_H_NOXKMEY6Ys1-RCdTau0SK2yz_pUDn2--25M_XcuDOLK0qw",
    description: "Som cristalino e graves potentes com cancelamento de ruído ativo."
  }
];

export const CATEGORIES = [
  { name: "Camisetas", icon: "Shirt" },
  { name: "Calças", icon: "Drama" },
  { name: "Bonés", icon: "HardHat" },
  { name: "Headphones", icon: "Headphones" },
  { name: "Tênis", icon: "Footprints" }
];

export const COLLECTIONS: Collection[] = [
  {
    id: 1,
    title: "Novo drop Supreme",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBrhA4HUsTuYxvSp7asSmgJBIC5Sq-yTTGvceCZNyhfEt1t_LgXY8HlQKMWxqmg0b4atc4RgP0rC89YRBxTaMYvxjU1unsZ6eZjfId2fDQrM__WQuF665boYMVDnfZCOA_ZlkTEMNuDRWEqKvG4Mp9zUJDQ6ELweHOe9sfEISWnEjHZwvg824zAFFkFimgJqZHsuEn3K9EJBcmLh-QbapeOdnEjNW1FhfbNAuuDyk9cjr-XDzaoHRcXuCSfShzhcrY2RaL_yND2Dhs",
    discount: "30% OFF",
    bgColor: "bg-[#D8E3F2]"
  }
];
