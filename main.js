const randomSerial = () => Math.random().toString(36).substring(2, 10);

window.addEventListener("DOMContentLoaded", () => {
    const serial = randomSerial();
    console.log(`Application started. Serial: ${serial}`);

    const serialCells = document.querySelectorAll(".asset-serial");
    serialCells.forEach((cell) => {
        cell.textContent = randomSerial();
    });
});