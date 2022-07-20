export function fixDropdown() {
    for (const dropdownToggle of document.querySelectorAll('.dropdown-toggle')) {
        new bootstrap.Dropdown(dropdownToggle);
    }

    const grid = document.querySelector('.grid');
    for (const dropdownMenu of document.querySelectorAll('ul.dropdown-menu')) {
        grid.after(dropdownMenu);
    }
};
