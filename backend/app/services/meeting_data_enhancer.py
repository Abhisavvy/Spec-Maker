"""
Enhances meeting data format to include all required spec sections.
Automatically fills in missing sections based on existing content.
"""
import re
from typing import Dict, List, Optional

class MeetingDataEnhancer:
    """
    Enhances meeting data to match complete spec structure.
    """
    
    def enhance_meeting_data(self, meeting_data: str) -> str:
        """
        Takes meeting data and enhances it with missing required sections.
        """
        # Parse existing sections
        sections = self._parse_sections(meeting_data)
        
        # Generate missing sections
        enhanced = self._build_enhanced_spec(sections, meeting_data)
        
        return enhanced
    
    def _parse_sections(self, content: str) -> Dict[str, str]:
        """Parse existing sections from meeting data."""
        sections = {}
        
        # Extract spec name
        name_match = re.search(r'^##\s+(.+?)\s*$', content, re.MULTILINE)
        if name_match:
            sections['name'] = name_match.group(1).strip()
        
        # Extract each section
        section_patterns = {
            'problem_statements': r'##\s+Problem statements\s*\n(.*?)(?=\n##|\Z)',
            'vision_anti_vision': r'##\s+Vision and anti-vision\s*\n(.*?)(?=\n##|\Z)',
            'business_goals': r'##\s+Business and Design Goals\s*\n(.*?)(?=\n##|\Z)',
            'opportunities': r'##\s+Opportunities\s*\n(.*?)(?=\n##|\Z)',
            'expected_upsides': r'##\s+Expected Upsides\s*\n(.*?)(?=\n##|\Z)',
            'overview': r'##\s+Overview\s*\n(.*?)(?=\n##|\Z)',
            'user_flow': r'##\s+User Flow\s*\n(.*?)(?=\n##|\Z)',
            'edge_cases': r'##\s+Edge Cases\s*\n(.*?)(?=\n##|\Z)',
            'ui_dev_requirement': r'##\s+UI dev requirement\s*\n(.*?)(?=\n##|\Z)',
            'sound_requirement': r'##\s+Sound requirement\s*\n(.*?)(?=\n##|\Z)',
            'experimentation_plan': r'##\s+Experimentation Plan\s*\n(.*?)(?=\n##|\Z)',
            'tracking_requirement': r'##\s+Tracking requirement\s*\n(.*?)(?=\n##|\Z)',
            'analysis_plan': r'##\s+Analysis Plan\s*\n(.*?)(?=\n##|\Z)',
        }
        
        for key, pattern in section_patterns.items():
            match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
            if match:
                sections[key] = match.group(1).strip()
        
        return sections
    
    def _build_enhanced_spec(self, sections: Dict[str, str], original: str) -> str:
        """Build complete spec with all required sections."""
        lines = []
        
        # 1. Title
        spec_name = sections.get('name', 'Feature Spec')
        lines.append(f"## {spec_name}\n")
        
        # 2. Problem statements
        if 'problem_statements' in sections:
            lines.append("## Problem statements")
            lines.append(sections['problem_statements'])
            lines.append("")
        else:
            lines.append("## Problem statements")
            lines.append("- [To be filled from meeting notes]")
            lines.append("")
        
        # 3. Vision and anti-vision
        if 'vision_anti_vision' in sections:
            lines.append("## Vision and anti-vision")
            lines.append(sections['vision_anti_vision'])
            lines.append("")
        else:
            lines.append("## Vision and anti-vision")
            lines.append("Vision\n- [To be filled]")
            lines.append("\nAnti-vision\n- [To be filled]")
            lines.append("")
        
        # 4. Business and Design Goals
        if 'business_goals' in sections:
            lines.append("## Business and Design Goals")
            lines.append(sections['business_goals'])
            lines.append("")
        else:
            lines.append("## Business and Design Goals")
            lines.append("- [To be filled with quantifiable goals]")
            lines.append("")
        
        # 5. Opportunities (often missing)
        if 'opportunities' in sections:
            lines.append("## Opportunities")
            lines.append(sections['opportunities'])
            lines.append("")
        else:
            # Generate from existing content
            opportunities = self._infer_opportunities(sections, original)
            lines.append("## Opportunities")
            lines.append(opportunities)
            lines.append("")
        
        # 6. Expected Upsides (often missing)
        if 'expected_upsides' in sections:
            lines.append("## Expected Upsides")
            lines.append(sections['expected_upsides'])
            lines.append("")
        else:
            # Generate from business goals
            upsides = self._infer_upsides(sections)
            lines.append("## Expected Upsides")
            lines.append(upsides)
            lines.append("")
        
        # 7. Overview
        if 'overview' in sections:
            lines.append("## Overview")
            lines.append(sections['overview'])
            lines.append("")
        else:
            lines.append("## Overview")
            lines.append("[Feature overview to be filled]")
            lines.append("")
        
        # 8. UI Screens (check if mentioned in flow)
        ui_screens = self._extract_ui_screens(sections, original)
        if ui_screens:
            for screen in ui_screens:
                lines.append(f"## {screen['name']} UI")
                lines.append(screen['content'])
                lines.append("")
        
        # 9. Flow (convert User Flow to proper format)
        if 'user_flow' in sections:
            flow_name = spec_name.replace(" ", "") + " Flow"
            lines.append(f"## {flow_name} Flow")
            # Convert to proper format
            flow_content = self._format_flow(sections['user_flow'])
            lines.append(flow_content)
            lines.append("")
        
        # 10. Edge Cases
        if 'edge_cases' in sections:
            lines.append("## Edge Cases")
            lines.append(sections['edge_cases'])
            lines.append("")
        else:
            lines.append("## Edge Cases")
            lines.append("- [To be identified: error scenarios, edge user behaviors]")
            lines.append("")
        
        # 11. UI dev requirement
        if 'ui_dev_requirement' in sections:
            lines.append("## UI dev requirement")
            lines.append(sections['ui_dev_requirement'])
            lines.append("")
        else:
            lines.append("## UI dev requirement")
            lines.append("- [Technical UI requirements to be specified]")
            lines.append("")
        
        # 12. Sound requirement
        if 'sound_requirement' in sections:
            lines.append("## Sound requirement")
            lines.append(sections['sound_requirement'])
            lines.append("")
        else:
            lines.append("## Sound requirement")
            lines.append("- [Sound/SFX requirements to be specified]")
            lines.append("")
        
        # 13. Experimentation Plan
        if 'experimentation_plan' in sections:
            lines.append("## Experimentation Plan")
            lines.append(sections['experimentation_plan'])
            lines.append("")
        else:
            # Generate basic plan
            exp_plan = self._generate_experimentation_plan(sections)
            lines.append("## Experimentation Plan")
            lines.append(exp_plan)
            lines.append("")
        
        # 14. Tracking requirement
        if 'tracking_requirement' in sections:
            lines.append("## Tracking requirement")
            lines.append(sections['tracking_requirement'])
            lines.append("")
        else:
            # Generate from goals
            tracking = self._generate_tracking_requirements(sections)
            lines.append("## Tracking requirement")
            lines.append(tracking)
            lines.append("")
        
        # 15. Analysis Plan
        if 'analysis_plan' in sections:
            lines.append("## Analysis Plan")
            lines.append(sections['analysis_plan'])
            lines.append("")
        else:
            # Generate from goals
            analysis = self._generate_analysis_plan(sections)
            lines.append("## Analysis Plan")
            lines.append(analysis)
            lines.append("")
        
        # 16. Changelog (always empty initially)
        lines.append("## Changelog")
        lines.append("- Initial spec creation")
        lines.append("")
        
        return "\n".join(lines)
    
    def _infer_opportunities(self, sections: Dict[str, str], original: str) -> str:
        """Infer opportunities from existing content."""
        opportunities = []
        
        # Check business goals for opportunities
        if 'business_goals' in sections:
            goals = sections['business_goals']
            if 'retention' in goals.lower():
                opportunities.append("- Opportunity to improve player retention through optimized D0 experience")
            if 'engagement' in goals.lower() or 'session' in goals.lower():
                opportunities.append("- Opportunity to increase session depth and player engagement")
            if 'ltv' in goals.lower() or 'monetization' in goals.lower():
                opportunities.append("- Opportunity to improve monetization and LTV through better early funnel")
        
        # Check vision for opportunities
        if 'vision_anti_vision' in sections:
            vision = sections['vision_anti_vision']
            if 'experiment' in vision.lower() or 'test' in vision.lower():
                opportunities.append("- Opportunity to validate improvements through data-driven experimentation")
        
        if not opportunities:
            opportunities.append("- Opportunity to improve player experience and key metrics")
            opportunities.append("- Opportunity to optimize based on data and player behavior")
        
        return "\n".join(opportunities)
    
    def _infer_upsides(self, sections: Dict[str, str]) -> str:
        """Infer expected upsides from business goals."""
        upsides = []
        
        if 'business_goals' in sections:
            goals = sections['business_goals']
            if 'retention' in goals.lower():
                upsides.append("- Improved D1 retention (target: X% increase, to be validated)")
            if 'engagement' in goals.lower():
                upsides.append("- Increased session depth and player engagement")
            if 'ltv' in goals.lower():
                upsides.append("- Improved LTV per new player (1-2%+ range including ads)")
        
        if 'overview' in sections:
            overview = sections['overview']
            if 'retention' in overview.lower():
                upsides.append("- Better D0→D1 retention conversion")
            if 'session' in overview.lower():
                upsides.append("- Deeper early session engagement")
        
        if not upsides:
            upsides.append("- Improved key metrics (to be quantified)")
            upsides.append("- Better player experience and engagement")
        
        return "\n".join(upsides)
    
    def _format_flow(self, flow_content: str) -> str:
        """Format user flow to proper spec format."""
        # If already has "Description:", keep it
        if "Description:" in flow_content:
            return flow_content
        
        # Otherwise, wrap in Description format
        return f"Description: {flow_content}\nMockup: {{FIGMA_IMAGE:FRAME_ID}}"
    
    def _extract_ui_screens(self, sections: Dict[str, str], original: str) -> List[Dict[str, str]]:
        """Extract UI screens mentioned in content."""
        screens = []
        # This would need more sophisticated parsing
        # For now, return empty - can be enhanced
        return screens
    
    def _generate_experimentation_plan(self, sections: Dict[str, str]) -> str:
        """Generate basic experimentation plan."""
        plan = []
        plan.append("- A/B test: Control vs. Treatment group")
        plan.append("- Hypothesis: [Feature] will improve [metric] by [X]%")
        plan.append("- Success criteria: Statistically significant improvement in [primary metric]")
        plan.append("- Timeline: 4 weeks minimum for statistical significance")
        plan.append("- Segmentation: Analyze by player segment, acquisition source, etc.")
        return "\n".join(plan)
    
    def _generate_tracking_requirements(self, sections: Dict[str, str]) -> str:
        """Generate tracking requirements from goals."""
        tracking = []
        
        if 'business_goals' in sections:
            goals = sections['business_goals']
            if 'retention' in goals.lower():
                tracking.append("- Track D1 retention rate for new players")
                tracking.append("- Track D0 funnel completion rate (games 1-3)")
            if 'engagement' in goals.lower():
                tracking.append("- Track session length and depth")
                tracking.append("- Track next-day engagement rate post-D0")
            if 'ltv' in goals.lower():
                tracking.append("- Track Ad LTV per new player")
        
        if not tracking:
            tracking.append("- Track primary success metric: [to be defined]")
            tracking.append("- Track secondary metrics: [to be defined]")
            tracking.append("- Track user behavior events: [to be defined]")
        
        return "\n".join(tracking)
    
    def _generate_analysis_plan(self, sections: Dict[str, str]) -> str:
        """Generate analysis plan from goals."""
        analysis = []
        analysis.append("- Compare treatment vs. control on primary metric")
        analysis.append("- Statistical significance: p < 0.05, minimum sample size: [TBD]")
        analysis.append("- Cohort analysis: Segment by player type, acquisition source")
        analysis.append("- Timeline: Analyze after 4 weeks, with interim checks at 1-2 weeks")
        analysis.append("- Reporting: Weekly updates, final analysis report")
        return "\n".join(analysis)
