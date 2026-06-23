
export default function Header(){
    const logoSrc = '/biokinetix/assets/biokinetix_big_nbg.png';

    return `
    <header>
        <div class="logo">
            <img src="${logoSrc}" alt="BioKinetiX logo" srcset="">
        </div>
        <nav>
            <a href="/biokinetix/index.html">Home</a>
            <a href="/biokinetix/pages/about.html">About</a>
            <a href="/biokinetix/pages/team.html">Team</a>
            <a href="/biokinetix/pages/model.html">Model</a>
            <a href="/biokinetix/pages/simulation.html">Simulation</a>
            <a href="/biokinetix/pages/analysis.html">Analysis</a>
        </nav>
    </header>
    `;
}