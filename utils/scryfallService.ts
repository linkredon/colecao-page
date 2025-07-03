/**
 * Serviço para busca de cartas na API do Scryfall
 * com suporte integrado a tradução de termos PT-BR para EN
 */

import { translatePtToEn } from './translationService';

/**
 * Realiza uma busca na API do Scryfall com tradução automática de termos PT-BR para EN
 * 
 * @param query String de busca original
 * @returns Resposta da API do Scryfall com os resultados da busca
 */
export const searchCardsWithTranslation = async (query: string) => {
  try {
    // Traduz a query original se necessário
    const translatedQuery = translatePtToEn(query);
    
    // Se houve tradução, insere uma lógica de OR para buscar tanto em PT quanto em EN
    const searchQuery = translatedQuery !== query 
      ? `${query} OR ${translatedQuery}`  // Busca o termo original OU o termo traduzido
      : query;
      
    const encodedQuery = encodeURIComponent(searchQuery);
    const url = `https://api.scryfall.com/cards/search?q=${encodedQuery}&order=name&dir=asc&unique=cards&page=1`;
    
    const response = await fetch(url);
    return response;
  } catch (e) {
    console.error('Erro ao buscar cartas com tradução:', e);
    throw e;
  }
};

/**
 * Busca uma carta específica na API do Scryfall pelo nome exato, com tradução PT-BR para EN
 * 
 * @param cardName Nome da carta
 * @returns A carta encontrada
 */
export const getCardByNameWithTranslation = async (cardName: string) => {
  try {
    // Traduz o nome da carta se necessário
    const translatedName = translatePtToEn(cardName);
    const encodedName = encodeURIComponent(translatedName);
    
    const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodedName}`);
    
    // Se a busca com nome traduzido falhar, tenta com o nome original
    if (!response.ok && translatedName !== cardName) {
      const originalNameResponse = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`);
      if (originalNameResponse.ok) {
        return await originalNameResponse.json();
      }
      throw new Error(`Carta não encontrada: ${cardName}`);
    }
    
    if (response.ok) {
      return await response.json();
    }
    throw new Error(`Carta não encontrada: ${cardName}`);
  } catch (e) {
    console.error('Erro ao buscar carta pelo nome com tradução:', e);
    throw e;
  }
};

/**
 * Busca todas as impressões de uma carta na API do Scryfall, considerando traduções
 * 
 * @param cardName Nome da carta
 * @returns Lista de todas as impressões da carta
 */
export const getAllPrintsByNameWithTranslation = async (cardName: string) => {
  try {
    // Traduz o nome da carta se necessário
    const translatedName = translatePtToEn(cardName);
    
    const query = `"${encodeURIComponent(translatedName)}"+unique:prints&order=released`;
    const response = await fetch(`https://api.scryfall.com/cards/search?q=${query}`);
    
    // Se a busca com nome traduzido falhar, tenta com o nome original
    if (!response.ok && translatedName !== cardName) {
      const originalQuery = `"${encodeURIComponent(cardName)}"+unique:prints&order=released`;
      const originalNameResponse = await fetch(`https://api.scryfall.com/cards/search?q=${originalQuery}`);
      return originalNameResponse;
    }
    
    return response;
  } catch (e) {
    console.error('Erro ao buscar impressões da carta com tradução:', e);
    throw e;
  }
};
