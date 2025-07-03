// Definição de tipos para cartas do Magic: The Gathering

export interface MTGCard {
  id: string
  name: string
  set_name: string
  set_code: string
  collector_number: string
  rarity: string
  mana_cost?: string
  cmc: number
  type_line: string
  oracle_text?: string
  power?: string
  toughness?: string
  artist: string
  lang: string
  released_at: string
  color_identity: string[]
  foil: boolean
  nonfoil: boolean
  prints_search_uri: string
  image_uris?: {
    normal: string
    small?: string
    art_crop?: string
  }
  card_faces?: Array<{
    name: string
    mana_cost?: string
    type_line: string
    oracle_text?: string
    power?: string
    toughness?: string
    image_uris?: {
      normal: string
      small?: string
      art_crop?: string
    }
  }>
}

export interface CollectionCard {
  card: MTGCard
  quantity: number
  condition: string
  foil: boolean
}

export interface UserCollection {
  id: string
  name: string
  description: string
  cards: CollectionCard[]
  createdAt: string
  updatedAt: string
  isPublic: boolean
}

export interface SavedFilter {
  id: string
  name: string
  filters: {
    busca: string
    raridade: string
    cor: string[]
    cmc: number[]
    tipo: string
    formato: string
  }
}

// Tipos para a busca na API Scryfall
export interface ScryfallResponse {
  object: string
  total_cards: number
  has_more: boolean
  next_page?: string
  data: MTGCard[]
}

export interface ScryfallPrint {
  id: string
  name: string
  set_name: string
  set_code: string
  collector_number: string
  rarity: string
  image_uris?: {
    small: string
    normal: string
  }
  card_faces?: Array<{
    image_uris?: {
      small: string
      normal: string
    }
  }>
}

export interface ScryfallPrintsResponse {
  object: string
  total_cards: number
  has_more: boolean
  data: ScryfallPrint[]
}
