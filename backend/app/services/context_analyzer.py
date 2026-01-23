import os
import json
from typing import List, Dict, Set
from app.services.parser import DocumentParser

class ContextAnalyzer:
    """
    Analyzes all existing specs to extract:
    - Common patterns and terminology
    - Existing features and systems
    - Potential conflicts
    - Style and structure guidelines
    """
    
    def __init__(self, cache_dir: str = "../data/context_cache"):
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)
        self.cache_file = os.path.join(cache_dir, "analyzed_context.json")
    
    def analyze_all_specs(self, gdds_dir: str, slides_dir: str, force_refresh: bool = False) -> Dict:
        """
        Analyze all specs and create a comprehensive knowledge base.
        Results are cached for performance.
        """
        # Check cache first
        if not force_refresh and os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'r') as f:
                    cached = json.load(f)
                    print(f"[CONTEXT] Loaded cached analysis: {cached['stats']}")
                    return cached
            except:
                pass
        
        print("[CONTEXT] Analyzing all specs (this may take a moment)...")
        
        # Load all documents
        gdds = DocumentParser.load_documents_from_dir(gdds_dir) if os.path.exists(gdds_dir) else []
        slides = DocumentParser.load_documents_from_dir(slides_dir) if os.path.exists(slides_dir) else []
        all_docs = gdds + slides
        
        # Extract knowledge
        analysis = {
            "stats": {
                "total_specs": len(all_docs),
                "total_chars": sum(len(d['content']) for d in all_docs)
            },
            "features": self._extract_features(all_docs),
            "terminology": self._extract_terminology(all_docs),
            "patterns": self._extract_patterns(all_docs),
            "ui_elements": self._extract_ui_elements(all_docs),
            "flows": self._extract_flows(all_docs),
            "style_guide": self._create_style_guide(all_docs[:5])
        }
        
        # Cache results
        with open(self.cache_file, 'w') as f:
            json.dump(analysis, f, indent=2)
        
        print(f"[CONTEXT] Analysis complete: {len(analysis['features'])} features, {len(analysis['terminology'])} terms")
        return analysis
    
    def _extract_features(self, docs: List[dict]) -> List[Dict]:
        """Extract all mentioned features and systems."""
        features = []
        
        for doc in docs:
            content = doc['content']
            lines = content.split('\n')
            
            for i, line in enumerate(lines):
                line_lower = line.lower()
                
                # Headers often indicate features
                if line.startswith('##') and not line.startswith('###'):
                    feature_name = line.replace('#', '').strip()
                    
                    # Get context (next 5 lines)
                    context_lines = lines[i+1:i+6]
                    context = '\n'.join(context_lines)
                    
                    features.append({
                        "name": feature_name,
                        "source": doc['filename'],
                        "context": context[:500]
                    })
        
        return features
    
    def _extract_terminology(self, docs: List[dict]) -> Dict[str, int]:
        """Extract common game-specific terms and their frequency."""
        terminology = {}
        
        # Common game terms to track
        game_terms = [
            'player', 'reward', 'currency', 'level', 'progression', 'unlock',
            'shop', 'purchase', 'daily', 'quest', 'mission', 'achievement',
            'leaderboard', 'tournament', 'event', 'season', 'battle pass',
            'inventory', 'collection', 'upgrade', 'boost', 'power-up',
            'matchmaking', 'pvp', 'pve', 'multiplayer', 'social',
            'notification', 'popup', 'modal', 'screen', 'flow', 'ui'
        ]
        
        for doc in docs:
            content_lower = doc['content'].lower()
            for term in game_terms:
                count = content_lower.count(term)
                terminology[term] = terminology.get(term, 0) + count
        
        # Sort by frequency
        return dict(sorted(terminology.items(), key=lambda x: x[1], reverse=True)[:50])
    
    def _extract_patterns(self, docs: List[dict]) -> Dict[str, List[str]]:
        """Extract common structural patterns."""
        patterns = {
            "section_headers": set(),
            "ui_patterns": [],
            "flow_patterns": []
        }
        
        for doc in docs:
            lines = doc['content'].split('\n')
            
            for line in lines:
                # Collect section headers
                if line.startswith('##') and not line.startswith('###'):
                    header = line.replace('#', '').strip()
                    patterns["section_headers"].add(header)
                
                # UI patterns (Key: Value format)
                if ':' in line and any(key in line for key in ['Header:', 'CTA:', 'Mockup:', 'Sub text:']):
                    patterns["ui_patterns"].append(line.strip())
        
        # Convert set to list for JSON serialization
        patterns["section_headers"] = list(patterns["section_headers"])
        
        return patterns
    
    def _extract_ui_elements(self, docs: List[dict]) -> List[str]:
        """Extract all UI elements mentioned."""
        ui_elements = set()
        
        ui_keywords = ['button', 'header', 'footer', 'popup', 'modal', 'screen', 
                       'tab', 'menu', 'icon', 'banner', 'card', 'list']
        
        for doc in docs:
            content_lower = doc['content'].lower()
            for keyword in ui_keywords:
                if keyword in content_lower:
                    ui_elements.add(keyword)
        
        return list(ui_elements)
    
    def _extract_flows(self, docs: List[dict]) -> List[Dict]:
        """Extract user flows."""
        flows = []
        
        for doc in docs:
            lines = doc['content'].split('\n')
            
            for i, line in enumerate(lines):
                if 'flow' in line.lower() and line.startswith('##'):
                    flow_name = line.replace('#', '').strip()
                    
                    # Get flow description (next 10 lines)
                    flow_lines = lines[i+1:i+11]
                    description = '\n'.join(flow_lines)
                    
                    flows.append({
                        "name": flow_name,
                        "source": doc['filename'],
                        "description": description[:800]
                    })
        
        return flows
    
    def _create_style_guide(self, sample_docs: List[dict]) -> Dict:
        """Create a style guide from sample specs."""
        if not sample_docs:
            return {}
        
        # Analyze writing style from samples
        total_chars = sum(len(d['content']) for d in sample_docs)
        total_lines = sum(d['content'].count('\n') for d in sample_docs)
        
        return {
            "avg_line_length": total_chars // max(total_lines, 1),
            "sample_intros": [d['content'][:500] for d in sample_docs[:2]],
            "common_phrases": self._extract_common_phrases(sample_docs)
        }
    
    def _extract_common_phrases(self, docs: List[dict]) -> List[str]:
        """Extract commonly used phrases."""
        phrases = []
        
        # Common opening phrases in specs
        phrase_indicators = [
            "This feature", "The player", "When the user", "Upon",
            "The goal is", "This allows", "Players can", "The system"
        ]
        
        for doc in docs:
            for phrase in phrase_indicators:
                if phrase in doc['content']:
                    # Find sentences with this phrase
                    sentences = doc['content'].split('.')
                    for sentence in sentences:
                        if phrase in sentence:
                            phrases.append(sentence.strip()[:200])
                            break
        
        return phrases[:10]
    
    def find_potential_conflicts(self, new_prompt: str, analysis: Dict) -> List[str]:
        """
        Check if the new spec might conflict with existing features.
        """
        conflicts = []
        prompt_lower = new_prompt.lower()
        
        # Check against existing features
        for feature in analysis['features']:
            feature_name_lower = feature['name'].lower()
            
            # Simple keyword matching
            prompt_words = set(prompt_lower.split())
            feature_words = set(feature_name_lower.split())
            
            overlap = prompt_words & feature_words
            if len(overlap) >= 2:  # At least 2 words match
                conflicts.append(
                    f"⚠️ Potential overlap with existing feature: '{feature['name']}' "
                    f"from {feature['source']}"
                )
        
        return conflicts
    
    def get_relevant_context(self, prompt: str, analysis: Dict, max_features: int = 10) -> str:
        """
        Get the most relevant context for a new spec based on the prompt.
        Optimized to reduce token usage while maintaining quality.
        """
        prompt_lower = prompt.lower()
        prompt_words = set(prompt_lower.split())
        
        # Score features by relevance
        scored_features = []
        for feature in analysis['features']:
            feature_words = set(feature['name'].lower().split())
            context_words = set(feature['context'].lower().split())
            
            overlap = len(prompt_words & (feature_words | context_words))
            if overlap > 0:
                scored_features.append((overlap, feature))
        
        # Sort by relevance
        scored_features.sort(reverse=True, key=lambda x: x[0])
        
        # Build context string (optimized - more concise)
        context_parts = []
        context_parts.append("RELEVANT FEATURES:\n")
        
        for score, feature in scored_features[:max_features]:
            # Truncate context more aggressively
            context = feature['context'][:200].replace('\n', ' ')
            context_parts.append(f"- {feature['name']} ({feature['source']}): {context}...")
        
        # Add terminology (compressed)
        top_terms = list(analysis['terminology'].items())[:15]
        context_parts.append(f"\nTERMINOLOGY: {', '.join([term for term, _ in top_terms])}")
        
        # Add style sample (just one, truncated)
        if analysis.get('style_guide', {}).get('sample_intros'):
            intro = analysis['style_guide']['sample_intros'][0][:300]
            context_parts.append(f"\nSTYLE SAMPLE: {intro}...")
        
        return "\n".join(context_parts)
