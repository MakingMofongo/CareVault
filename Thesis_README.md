# CareVault Thesis Document

This directory contains the LaTeX source files for the CareVault project thesis document.

## Files

- `CareVault_Thesis.tex` - Main LaTeX document
- `compile_thesis.bat` - Windows batch script for compilation
- `Thesis_README.md` - This file

## Prerequisites

To compile the LaTeX document, you need a LaTeX distribution installed on your system:

### Windows
- **MiKTeX**: Download from https://miktex.org/
- **TeX Live**: Download from https://www.tug.org/texlive/

### macOS
- **MacTeX**: Download from https://www.tug.org/mactex/

### Linux
- **TeX Live**: Install via package manager
  ```bash
  sudo apt-get install texlive-full  # Ubuntu/Debian
  sudo yum install texlive-scheme-full  # CentOS/RHEL
  ```

## Compilation

### Windows
1. Double-click `compile_thesis.bat` to run the compilation script
2. The script will automatically run pdflatex multiple times to resolve cross-references
3. Check for `CareVault_Thesis.pdf` in the same directory

### Manual Compilation
If you prefer to compile manually or are on a different operating system:

```bash
pdflatex CareVault_Thesis.tex
pdflatex CareVault_Thesis.tex  # Run twice for cross-references
```

## Document Structure

The thesis follows the research paper format and includes:

1. **Title Page** - Project title, abstract, and keywords
2. **Table of Contents** - Automatic generation
3. **Introduction** - Problem statement and research objectives
4. **Literature Review** - Background research and related work
5. **Methodology** - Research approach and system design
6. **System Design and Implementation** - Technical details
7. **Results and Analysis** - Performance metrics and findings
8. **Discussion** - Key findings and implications
9. **Conclusion** - Summary and future work
10. **References** - Academic citations
11. **Figures and Tables** - Visual elements

## Customization

### Adding Figures
Place image files in the same directory and update the figure references in the LaTeX file:

```latex
\begin{figure}[H]
\centering
\includegraphics[width=0.8\textwidth]{your_image.png}
\caption{Your Caption}
\label{fig:label}
\end{figure}
```

### Modifying Content
- Edit the main content in the respective sections
- Update the abstract and keywords on the title page
- Modify the word count if needed
- Add or remove sections as required

### Styling
The document uses:
- Times New Roman font (12pt)
- A4 paper size
- 2.5cm margins
- Harvard citation style
- Professional academic formatting

## Troubleshooting

### Common Issues

1. **Missing packages**: Install additional LaTeX packages if prompted
2. **Image not found**: Ensure image files are in the correct directory
3. **Compilation errors**: Check LaTeX syntax and ensure all packages are installed

### Getting Help
- Check the LaTeX documentation for your distribution
- Use online LaTeX editors like Overleaf for testing
- Consult LaTeX community forums for specific issues

## Notes

- The document is approximately 6,847 words (excluding figures, tables, and references)
- It follows academic research paper standards
- Includes proper conflict of interest and informed consent declarations
- Uses Harvard citation style as specified in the guidelines
- Designed for professional academic presentation

## License

This thesis document is part of the CareVault project and follows the same licensing terms as the main project. 