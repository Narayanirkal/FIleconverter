# Image Conversion &amp; Resize Toolkit

A clean, modern, fully client-side utility toolkit designed for developers and designers. This web application offers two distinct, high-fidelity image tools wrapped in a cohesive, responsive interface matching Google's **Material 3 (Material You)** design guidelines.

Since the toolkit is built using 100% static HTML, CSS, and vanilla ES6 Javascript (with zero dependencies, no jQuery, and no build stages), it runs entirely in the browser and is ready for immediate deployment to **GitHub Pages**.

---

## 🛠️ Main Features

The toolkit is split into two specialized tabs:

### 1. C-Array Converter (Image to RGB565)
Converts screen bitmaps directly into 16-bit RGB565 C-style header files, halving flash usage compared to traditional 32-bit/24-bit representation. Optimized for hardware controllers (such as the ILI9341 display buffer).
* **Dynamic Auto-Mapping**: Automatically parses uploaded filenames to generate C variable names, guard macros, and width/height macros (e.g., `Home.png` -> `Home`, `HOME_WIDTH`, `HOME_HEIGHT`).
* **Independent / Decoupled Scaling**: Width and height inputs are decoupled by default to match independent python script constraints, with an optional aspect-ratio lock checkbox.
* **Pre-Quantized Preview**: Renders a pixelated canvas preview showing exactly how the 16-bit color reduction will look on the physical display before compiling.
* **Editable Code Editor**: The output code text area is fully editable directly in the browser so you can adjust parameters before saving.
* **Math Parity**: Uses optimized direct conversion logic:
  ```javascript
  val565 = ((b & 0xF8) << 8) | ((g & 0xFC) << 3) | (r >> 3);
  ```
  This matches the standard BGR565 display registers.

### 2. Image Resizer
A high-fidelity image resizing tool modeled after PIL's `Image.resize` Lancet scaling.
* **Direct Target Dimensions**: Configured with a default target resolution of `1386` × `1386` px (ideal for standard square corporate banners), fully customizable.
* **Format Selector**: Export your resized image as a JPEG (`.jpg`) or PNG (`.png`).
* **Quality Slider**: Adjust the compression factor (from 10% to 100%) when exporting as JPEG.
* **High-Fidelity Resampling**: Utilizes browser-native high-fidelity interpolation algorithms (`ctx.imageSmoothingQuality = 'high'`).
* **Output Naming Conformance**: Resized downloads are automatically appended with the `_final` suffix (e.g., `banner_final.jpg`) to conform with script automation guidelines.

---

## 🎨 Design Aesthetics (Material 3)

The user interface follows the official **Material 3 Design System**:
* **Dynamic Color Tokens**: Styled using M3 baseline blue (`#005faf`) as primary brand color, light gray surface cards (`#ffffff`), and soft container boundaries (`#f0f4f8` / `#c3c7cf`).
* **Segmented Controls**: Navigation tabs are styled as a capsule Segmented Control bar with pill-shaped selection overlays.
* **Rounded Shapes**: Capsules buttons (`100px` rounded corners), Outlined Cards (`16px` rounded corners), and text boxes (`8px` rounded corners) with M3 focus borders.
* **Solid Colors**: Flat aesthetic with no neon colors, glows, or glassmorphic blurs, ensuring clean visibility and speed.

---

## 🚀 How to Run Locally

1. Clone or download the repository.
2. Open `index.html` in any modern web browser.
3. No local server, `npm install`, or python environments are required!

---

## 📁 Project Structure

* [index.html](file:///d:/FileToCArray/index.html) - Application structural layout.
* [css/style.css](file:///d:/FileToCArray/css/style.css) - Material 3 stylesheet tokens and layouts.
* [scripts/main.js](file:///d:/FileToCArray/scripts/main.js) - Core conversion math, tab navigation, and download handlers.
* [Images/icon.svg](file:///d:/FileToCArray/Images/icon.svg) - Vector brand logo.
* [Images/favicon.svg](file:///d:/FileToCArray/Images/favicon.svg) - Vector tab icon.

---

## 🔗 Links

* **GitHub Repository**: [https://github.com/Narayanirkal/FIleconverter](https://github.com/Narayanirkal/FIleconverter)
