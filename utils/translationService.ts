/**
 * Serviço para tradução de termos de cartas de Magic: The Gathering
 * do português para o inglês para facilitar as buscas
 */

// Dicionário de traduções comuns para termos de MTG
const commonMTGTranslations: Record<string, string> = {
  // Tipos de carta
  "criatura": "creature",
  "terreno": "land",
  "mágica instantânea": "instant",
  "instantânea": "instant",
  "feitiço": "sorcery",
  "artefato": "artifact",
  "encantamento": "enchantment", 
  "planeswalker": "planeswalker",
  
  // Subtipos comuns
  "elfo": "elf",
  "elfos": "elves",
  "humano": "human",
  "humanos": "humans",
  "zumbi": "zombie",
  "zumbis": "zombies",
  "goblin": "goblin",
  "goblins": "goblins",
  "clérigo": "cleric",
  "clérigos": "clerics",
  "guerreiro": "warrior",
  "guerreiros": "warriors",
  "mago": "wizard", 
  "magos": "wizards",
  "anjo": "angel",
  "anjos": "angels",
  "demônio": "demon",
  "demônios": "demons",
  "dragão": "dragon",
  "dragões": "dragons",
  "besta": "beast",
  "bestas": "beasts",
  "druida": "druid", 
  "druidas": "druids",
  "vampiro": "vampire",
  "vampiros": "vampires",
  
  // Cores
  "branco": "white",
  "azul": "blue",
  "preto": "black",
  "vermelho": "red",
  "verde": "green",
  "incolor": "colorless",
  "multicolorido": "multicolored",
  
  // Habilidades
  "voar": "flying",
  "toque mortífero": "deathtouch",
  "vínculo com a vida": "lifelink",
  "iniciativa": "first strike",
  "alcance": "reach",
  "vigilância": "vigilance",
  "atropelar": "trample",
  "lampejo": "flash",
  "ímpeto": "haste",
  "proteção": "protection",
  "indestrutível": "indestructible",
  
  // Termos de regras
  "exile": "exile",
  "exilar": "exile",
  "compre": "draw",
  "comprar": "draw",
  "contra-magia": "counterspell",
  "anular": "counter",
  "destruir": "destroy",
  "sacrificar": "sacrifice",
  "retornar": "return",
  "mana": "mana",
  
  // Cartas específicas populares
  "força do gigante": "giant growth",
  "choque": "shock",
  "elfos de llanowar": "llanowar elves",
  "contramágica": "counterspell",
  "relâmpago": "lightning bolt",
  "terror": "terror",
  "crescimento gigante": "giant growth",
  "serra anjo": "serra angel",
  "urso runha": "runeclaw bear"
};

/**
 * Traduz uma string do português para o inglês
 * Primeiro verifica no dicionário de traduções comuns
 * Se não encontrar, faz um algoritmo de correspondência parcial
 */
export const translatePtToEn = (text: string): string => {
  const lowerText = text.toLowerCase().trim();
  
  // Verifica se o texto exato está no dicionário
  if (commonMTGTranslations[lowerText]) {
    return commonMTGTranslations[lowerText];
  }
  
  // Verifica palavras individuais
  const words = lowerText.split(/\s+/);
  if (words.length > 1) {
    const translatedWords = words.map(word => commonMTGTranslations[word] || word);
    return translatedWords.join(' ');
  }
  
  // Se não encontrou tradução, retorna o texto original
  return text;
};

/**
 * Verifica se uma carta corresponde a um termo de busca,
 * considerando tanto o termo original quanto sua tradução
 */
export const cardMatchesSearchTerm = (card: any, searchTerm: string): boolean => {
  if (!searchTerm.trim()) return true;
  
  const search = searchTerm.toLowerCase();
  const translated = translatePtToEn(search);
  
  // Verifica se o termo original ou traduzido corresponde ao nome ou tipo da carta
  return card.name.toLowerCase().includes(search) ||
         card.type_line?.toLowerCase().includes(search) ||
         card.oracle_text?.toLowerCase().includes(search) ||
         (translated !== search && (
           card.name.toLowerCase().includes(translated) ||
           card.type_line?.toLowerCase().includes(translated) ||
           card.oracle_text?.toLowerCase().includes(translated)
         ));
};
