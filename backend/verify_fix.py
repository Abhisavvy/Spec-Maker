from app.services.pptx_generator import PPTXGenerator
import os

# Mock Data
mock_figma_images = {
    "1:2": "https://via.placeholder.com/300.png",
    "3:4": "https://via.placeholder.com/150.png"
}

# Mock LLM Output (Markdown)
llm_output = """
# My Awesome Feature
- **Header**: Login
- **Sub text**: Please enter your credentials
- **CTA**: Login Button
- **CTA functionality**: Validates user and redirects to dashboard
- **Surfacing conditions**: User is not logged in
- **Popup Priority**: High
- **Mockup**: {{FIGMA_IMAGE:1:2}}

# Onboarding Flow
- **Description**: Step 1: User opens app.
- **Mockup**: {{FIGMA_IMAGE:3:4}}
- **Description**: Step 2: User sees welcome screen.
- **Mockup**: {{FIGMA_IMAGE:3:4}}

# Vision and anti-vision
**Vision**
* To create a high-value...
* To deepen player engagement...

**Anti-vision**
* The free track should not...

# Business Goals
**Business Goals**
* Increase IAP revenue...
"""

# Simulate GeneratorService Post-Processing
print("--- Simulating GeneratorService ---")
processed_text = llm_output
for f_id, url in mock_figma_images.items():
    print(f"Replacing {f_id} with {url}")
    processed_text = processed_text.replace(f"{{{{FIGMA_IMAGE:{f_id}}}}}", f"![Mockup]({url})")

print("\n--- Processed Text ---")
print(processed_text)

# Run PPTXGenerator
print("\n--- Running PPTXGenerator ---")
generator = PPTXGenerator()
output_path = "verify_output.pptx"
template_path = "../data/slides/Spec Template.pptx"

try:
    generator.create_presentation(processed_text, output_path, template_path)
    print(f"\nSuccess! Generated {output_path}")
except Exception as e:
    print(f"\nError: {e}")
