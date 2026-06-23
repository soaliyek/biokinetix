
export default function Header(){
    const logoSrc = '/biokinetix/data/logo.png';

    return `
    <header>
        <div class="logo">
            <img src="${logoSrc}" alt="BioKinetiX logo" srcset="">
        </div>
        <nav>
            <a href="/biokinetix/index.html">Home</a>
            <a href="/biokinetix/about.html">About</a>
            <a href="/biokinetix/team.html">Team</a>
            <a href="/biokinetix/mathematical_model/model.html">Model</a>
            <a href="/biokinetix/simulation.html">Simulation</a>
            <a href="/biokinetix/analysis.html">Analysis</a>
        </nav>
    </header>
    `;
}