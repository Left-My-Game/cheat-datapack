async function generateDatapack() {
  const username = document.getElementById('username').value;
  if (!username) {
    alert('Please enter a username!');
    return;
  }

  try {
    const response = await fetch('template_datapack.zip');
    if (!response.ok) {
      throw new Error(`Failed to load template_datapack.zip (status: ${response.status})`);
    }

    const blob = await response.blob();
    const zip = await JSZip.loadAsync(blob);
    const newZip = new JSZip();

    const textFileExtensions = ['.mcfunction', '.json', '.mcmeta', '.txt', '.yml', '.yaml', '.lang'];

    await Promise.all(Object.keys(zip.files).map(async (filename) => {
      const file = zip.files[filename];
      if (!file.dir) {
        const lowerFilename = filename.toLowerCase();
        const isTextFile = textFileExtensions.some(ext => lowerFilename.endsWith(ext));

        if (isTextFile) {
          const content = await file.async("string");
          const newContent = content.replace(/YourUsername/g, username);
          newZip.file(filename, newContent);
        } else {
          const binaryContent = await file.async("arraybuffer");
          newZip.file(filename, binaryContent);
        }
      } else {
        newZip.folder(filename);
      }
    }));

    const newBlob = await newZip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(newBlob);
    link.download = `Cheats.zip`;
    link.click();
  } catch (error) {
    console.error('Error generating datapack:', error);
    alert('Something went wrong. Check the console for details.');
  }
}
