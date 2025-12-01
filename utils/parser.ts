import { PlaceData } from '../types';

/**
 * Parses a Markdown table string into an array of PlaceData objects.
 * Assumes the table has specific columns: Name, Address, Rating, Reviews, Website, Phone.
 */
export const parseMarkdownTableToData = (markdown: string): PlaceData[] => {
  const lines = markdown.trim().split('\n');
  const data: PlaceData[] = [];
  
  // Find the separator line (e.g., |---|---|...)
  const separatorIndex = lines.findIndex(line => line.trim().startsWith('|') && line.includes('---'));
  
  if (separatorIndex === -1 || separatorIndex + 1 >= lines.length) {
    return [];
  }

  // Iterate over rows after the separator
  for (let i = separatorIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('|')) continue;

    const columns = line
      .split('|')
      .map(col => col.trim())
      .filter((col, index, arr) => index > 0 && index < arr.length - 1); // Remove leading/trailing empty splits

    if (columns.length >= 2) { // Ensure at least Name and Address
      data.push({
        id: crypto.randomUUID(),
        name: columns[0] || 'N/A',
        address: columns[1] || 'N/A',
        rating: columns[2] || 'N/A',
        reviews: columns[3] || 'N/A',
        website: columns[4] || 'N/A',
        phone: columns[5] || 'N/A',
      });
    }
  }

  return data;
};

export const convertToCSV = (data: PlaceData[]): string => {
  const headers = ['Name', 'Address', 'Rating', 'Reviews', 'Website', 'Phone', 'Google Maps URL'];
  const rows = data.map(place => [
    `"${place.name.replace(/"/g, '""')}"`,
    `"${place.address.replace(/"/g, '""')}"`,
    `"${place.rating}"`,
    `"${place.reviews}"`,
    `"${place.website}"`,
    `"${place.phone}"`,
    `"${place.googleMapsUrl || ''}"`
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
};

export const downloadCSV = (csvContent: string, filename: string) => {
  // Add Byte Order Mark (BOM) for UTF-8 so Excel opens it correctly
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};