export interface Burger {
  id: number
  src: string
  name: string
  description: string
  price: number
}

export const burgers: Burger[] = [
  { id: 1, src: '/burgers/burger1.webp', name: 'Double Layer Burger', description: 'Delicious retreat for the soul', price: 8.5 },
  { id: 2, src: '/burgers/burger2.webp', name: 'Smoky BBQ Burger', description: 'Bold smoky flavour in every bite', price: 7.25 },
  { id: 3, src: '/burgers/burger3.webp', name: 'Spicy Queen Burger', description: 'For those who like it hot', price: 7.75 },
  { id: 4, src: '/burgers/burger4.webp', name: 'Classic Cheeseburger', description: 'A timeless classic, never disappoints', price: 6.5 },
  { id: 5, src: '/burgers/burger1.webp', name: 'Mushroom Swiss Burger', description: 'Earthy mushrooms meet melted swiss', price: 8.0 },
  { id: 6, src: '/burgers/burger2.webp', name: 'Bacon Deluxe Burger', description: 'Loaded with crispy smoked bacon', price: 9.25 },
]

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
