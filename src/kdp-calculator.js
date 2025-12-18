export class KDPCalculator {
  constructor() {
    this.kdpFormats = {
      "6x9": { width: 6.0, height: 9.0, trim_size: "6 × 9 inches" },
      "8.5x11": { width: 8.5, height: 11.0, trim_size: "8.5 × 11 inches" }
    };
  }

  calculatePreciseSpecs(format, pages, paperType = "white", bookType = "paperback") {
    const formatSpec = this.kdpFormats[format];
    if (!formatSpec) {
      throw new Error(`Format ${format} non supporté`);
    }

    const spineWidth = pages * 0.0025;
    const totalWidth = (formatSpec.width * 2) + spineWidth;

    return {
      format,
      pages,
      width: formatSpec.width,
      height: formatSpec.height,
      spine_width: spineWidth,
      total_width: totalWidth,
      total_width_mm: Math.round(totalWidth * 25.4),
      height_mm: Math.round(formatSpec.height * 25.4),
      paper: paperType
    };
  }

  generateSummary(specs) {
    return `
📘 Format : ${specs.format}
📄 Pages : ${specs.pages}
📏 Largeur couverture : ${specs.total_width.toFixed(2)} pouces (${specs.total_width_mm} mm)
📐 Hauteur couverture : ${specs.height.toFixed(2)} pouces (${specs.height_mm} mm)
📚 Dos : ${specs.spine_width.toFixed(2)} pouces
🧾 Type de papier : ${specs.paper}
    `.trim();
  }

  validateAgainstKDP(specs) {
    const maxWidthMm = 450;
    const maxHeightMm = 300;
    const maxSpineWidth = 3.2;

    if (specs.total_width_mm > maxWidthMm) {
      return { valid: false, reason: "Largeur trop grande" };
    }
    if (specs.height_mm > maxHeightMm) {
      return { valid: false, reason: "Hauteur trop grande" };
    }
    if (specs.spine_width > maxSpineWidth) {
      return { valid: false, reason: "Dos trop large" };
    }
    return { valid: true, reason: "OK" };
  }

  getAllKDPFormats() {
    // Retourne un tableau des formats disponibles
    return Object.entries(this.kdpFormats).map(([key, data]) => ({
      format: key,
      ...data
    }));
  }
}
