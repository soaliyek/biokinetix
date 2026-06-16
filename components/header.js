
function Header(active = 'home') {
    const activeClass = (route) => route === active ? ' class="active"' : '';

    return `
        <nav>
            <a href="home"${activeClass('home')}>Home</a>
            <a href="about"${activeClass('about')}>About</a>
        </nav>
        <h1>BioKinetiX</h1>
    `;
}
export default Header;