import re
import math
from typing import List, Dict, Any

class LLMShoppingAssistant:
    """
    Simulated LLM Agent with Intent Parsing, Named Entity Recognition (NER),
    and Natural Language Generation for local commerce querying.
    """
    def __init__(self):
        self.categories = ["electronics", "grocery", "apparel", "footwear", "home"]
        
    def parse_intent_and_entities(self, prompt: str) -> Dict[str, Any]:
        prompt_lower = prompt.lower()
        
        # Intent detection
        intent = "search_product"
        if any(w in prompt_lower for w in ["recommend", "suggest", "best"]):
            intent = "recommend_product"
        elif any(w in prompt_lower for w in ["cheap", "under", "budget", "affordable"]):
            intent = "budget_search"
            
        # Price Entity Extraction using Regex
        max_price = 1000.0
        price_match = re.search(r'(?:under|below|less than|\$)\s*(\d+(?:\.\d+)?)', prompt_lower)
        if price_match:
            max_price = float(price_match.group(1))
            
        # Category Extraction
        matched_category = None
        for cat in self.categories:
            if cat in prompt_lower:
                matched_category = cat
                break
                
        # Keyword / Tag Extraction
        words = re.findall(r'\w+', prompt_lower)
        stopwords = {"i", "need", "want", "for", "a", "an", "the", "in", "under", "below", "with", "and", "or", "to", "show", "me", "find", "buy"}
        extracted_tags = [w for w in words if w not in stopwords and not w.isdigit()]
        
        return {
            "intent": intent,
            "max_price": max_price,
            "category": matched_category,
            "keywords": extracted_tags
        }

    def generate_response(self, query: str, matched_products: List[Dict[str, Any]]) -> str:
        if not matched_products:
            return f"I analyzed your request '{query}', but couldn't find any matching local shop items within those specifications."
        
        top_item = matched_products[0]
        return (f"AI Summary: Based on your query '{query}', I found {len(matched_products)} local shop items. "
                f"Top recommendation is '{top_item['name']}' from '{top_item['seller_name']}' priced at ${top_item['price']:.2f}.")


class VectorSemanticMatcher:
    """
    Embedding & Vector Cosine Similarity Engine for semantic matching between 
    unstructured user text and structured inventory attributes.
    """
    def __init__(self):
        self.vocabulary = set()

    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r'\w+', text.lower())

    def _build_vector(self, tokens: List[str], vocab: List[str]) -> List[int]:
        return [tokens.count(word) for word in vocab]

    def _cosine_similarity(self, vec1: List[int], vec2: List[int]) -> float:
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        magnitude1 = math.sqrt(sum(a * a for a in vec1))
        magnitude2 = math.sqrt(sum(b * b for b in vec2))
        if magnitude1 == 0 or magnitude2 == 0:
            return 0.0
        return dot_product / (magnitude1 * magnitude2)

    def rank_products(self, query: str, products: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        query_tokens = self._tokenize(query)
        
        # Aggregate vocabulary
        vocab = set(query_tokens)
        product_token_map = {}
        for p in products:
            text_corpus = f"{p['name']} {p['category']} {' '.join(p['tags'])} {p['seller_name']}"
            p_tokens = self._tokenize(text_corpus)
            product_token_map[p['id']] = p_tokens
            vocab.update(p_tokens)
            
        vocab_list = sorted(list(vocab))
        query_vec = self._build_vector(query_tokens, vocab_list)
        
        scored_products = []
        for p in products:
            p_vec = self._build_vector(product_token_map[p['id']], vocab_list)
            sim_score = self._cosine_similarity(query_vec, p_vec)
            scored_products.append((sim_score, p))
            
        # Sort descending by cosine similarity score
        scored_products.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored_products if item[0] > 0 or not query.strip()]


class FraudRiskClassifierML:
    """
    Machine Learning Anomaly Classifier for checking high-risk transactions.
    """
    def evaluate_risk(self, order_amount: float, item_stock: int, quantity: int) -> Dict[str, Any]:
        risk_score = 0.0
        flags = []
        
        if order_amount > 500.0:
            risk_score += 0.4
            flags.append("High monetary value purchase")
            
        if quantity > item_stock * 0.8:
            risk_score += 0.5
            flags.append("Order volume exceeds 80% of total local store inventory")
            
        if quantity >= 10:
            risk_score += 0.3
            flags.append("Bulk purchase threshold triggered")
            
        status = "Approved"
        if risk_score >= 0.7:
            status = "Flagged for Manual Verification"
            
        return {
            "risk_score": round(min(risk_score, 1.0), 2),
            "status": status,
            "risk_flags": flags
        }
