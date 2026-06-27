%% =========================================================
%  BioKinetiX — Two-Compartment Pharmacokinetic Model
%  Team: BioKinetiX
%  Course: MATH221 & CE122
%  Description: Numerical simulation of intravascular drug
%               concentration using Euler, RK4, and
%               Adams-Bashforth-Moulton methods.
%               Results compared against the analytical
%               (exact) solution.
%% =========================================================

clc;
clear;
close all;

%% =========================================================
%  1. PARAMETER INITIALISATION
%% =========================================================

k10 = 0.05;   % Elimination rate constant from central compartment (1/h)
k12 = 0.50;   % Transfer rate constant: central -> peripheral (1/h)
k21 = 0.25;   % Transfer rate constant: peripheral -> central (1/h)

Cc0 = 0;      % Initial drug concentration in central compartment (mg/L)
Cp0 = 200;    % Initial drug concentration in peripheral compartment (mg/L)

dt  = 0.1;    % Time step (h)
t   = 0:dt:10; % Time vector from 0 to 10 hours
N   = length(t);

%% =========================================================
%  2. ODE RIGHT-HAND SIDE FUNCTIONS
%     f1 = dCc/dt,  f2 = dCp/dt
%% =========================================================

f1 = @(Cc, Cp) -(k12 + k10)*Cc + k21*Cp;
f2 = @(Cc, Cp)  k12*Cc - k21*Cp;

%% =========================================================
%  3. ANALYTICAL (EXACT) SOLUTION
%     Derived via eigenvalue decomposition of system matrix A
%% =========================================================

% System matrix A
A_mat = [-(k12+k10),  k21;
          k12,       -k21];

% Eigenvalues
lambda1 = -0.0159;
lambda2 = -0.78405;

% Constants from initial conditions (see derivation in report)
a = 139.05;
b =  60.94;

Cc_exact = 65.089*exp(lambda1*t) - 65.09*exp(lambda2*t);
Cp_exact = 139.05*exp(lambda1*t) + 60.94*exp(lambda2*t);

%% =========================================================
%  4. EULER METHOD
%% =========================================================

Cc_euler = zeros(1, N);
Cp_euler = zeros(1, N);
Cc_euler(1) = Cc0;
Cp_euler(1) = Cp0;

for i = 1:N-1
    Cc_euler(i+1) = Cc_euler(i) + dt * f1(Cc_euler(i), Cp_euler(i));
    Cp_euler(i+1) = Cp_euler(i) + dt * f2(Cc_euler(i), Cp_euler(i));
end

%% =========================================================
%  5. FOURTH-ORDER RUNGE-KUTTA METHOD (RK4)
%% =========================================================

Cc_rk4 = zeros(1, N);
Cp_rk4 = zeros(1, N);
Cc_rk4(1) = Cc0;
Cp_rk4(1) = Cp0;

for i = 1:N-1
    Cc = Cc_rk4(i);
    Cp = Cp_rk4(i);

    % Central compartment slopes
    m1 = dt * f1(Cc,         Cp        );
    m2 = dt * f1(Cc + m1/2,  Cp + m1/2 );
    m3 = dt * f1(Cc + m2/2,  Cp + m2/2 );
    m4 = dt * f1(Cc + m3,    Cp + m3   );

    % Peripheral compartment slopes
    l1 = dt * f2(Cc,         Cp        );
    l2 = dt * f2(Cc + l1/2,  Cp + l1/2 );
    l3 = dt * f2(Cc + l2/2,  Cp + l2/2 );
    l4 = dt * f2(Cc + l3,    Cp + l3   );

    Cc_rk4(i+1) = Cc + (m1 + 2*m2 + 2*m3 + m4) / 6;
    Cp_rk4(i+1) = Cp + (l1 + 2*l2 + 2*l3 + l4) / 6;
end

%% =========================================================
%  6. ADAMS-BASHFORTH-MOULTON METHOD (ABM)
%     Initialised with RK4 for first 4 steps
%% =========================================================

Cc_abm = zeros(1, N);
Cp_abm = zeros(1, N);

% Use RK4 values for the first 4 steps (required for ABM startup)
Cc_abm(1:4) = Cc_rk4(1:4);
Cp_abm(1:4) = Cp_rk4(1:4);

% Precompute derivative history
F1 = zeros(1, N);
F2 = zeros(1, N);
for i = 1:4
    F1(i) = f1(Cc_abm(i), Cp_abm(i));
    F2(i) = f2(Cc_abm(i), Cp_abm(i));
end

for i = 4:N-1
    % Adams-Bashforth Predictor (4-step explicit)
    Cc_pred = Cc_abm(i) + (dt/24) * (55*F1(i) - 59*F1(i-1) + 37*F1(i-2) - 9*F1(i-3));
    Cp_pred = Cp_abm(i) + (dt/24) * (55*F2(i) - 59*F2(i-1) + 37*F2(i-2) - 9*F2(i-3));

    % Predicted derivatives
    F1_pred = f1(Cc_pred, Cp_pred);
    F2_pred = f2(Cc_pred, Cp_pred);

    % Adams-Moulton Corrector (4-step implicit)
    Cc_abm(i+1) = Cc_abm(i) + (dt/24) * (9*F1_pred + 19*F1(i) - 5*F1(i-1) + F1(i-2));
    Cp_abm(i+1) = Cp_abm(i) + (dt/24) * (9*F2_pred + 19*F2(i) - 5*F2(i-1) + F2(i-2));

    % Update derivative history
    F1(i+1) = f1(Cc_abm(i+1), Cp_abm(i+1));
    F2(i+1) = f2(Cc_abm(i+1), Cp_abm(i+1));
end

%% =========================================================
%  7. ERROR ANALYSIS
%     Absolute error = |numerical - exact|
%% =========================================================

err_euler_c = abs(Cc_euler - Cc_exact);
err_rk4_c   = abs(Cc_rk4   - Cc_exact);
err_abm_c   = abs(Cc_abm   - Cc_exact);

err_euler_p = abs(Cp_euler - Cp_exact);
err_rk4_p   = abs(Cp_rk4   - Cp_exact);
err_abm_p   = abs(Cp_abm   - Cp_exact);

% Average errors
avg_euler_c = mean(err_euler_c);
avg_rk4_c   = mean(err_rk4_c);
avg_abm_c   = mean(err_abm_c);

avg_euler_p = mean(err_euler_p);
avg_rk4_p   = mean(err_rk4_p);
avg_abm_p   = mean(err_abm_p);

overall_euler = (avg_euler_c + avg_euler_p) / 2;
overall_rk4   = (avg_rk4_c   + avg_rk4_p)   / 2;
overall_abm   = (avg_abm_c   + avg_abm_p)   / 2;

fprintf('===== Average Error Summary =====\n');
fprintf('Euler Method:            Central = %.4f | Peripheral = %.4f | Overall = %.4f (%.2f%%)\n', avg_euler_c, avg_euler_p, overall_euler, overall_euler*100);
fprintf('RK4 Method:              Central = %.4f | Peripheral = %.4f | Overall = %.4f (%.2f%%)\n', avg_rk4_c,   avg_rk4_p,   overall_rk4,   overall_rk4*100);
fprintf('Adams-Bashforth-Moulton: Central = %.4f | Peripheral = %.4f | Overall = %.4f (%.2f%%)\n', avg_abm_c,   avg_abm_p,   overall_abm,   overall_abm*100);

%% =========================================================
%  8. FIGURE 1 — DRUG CONCENTRATION PROFILES (2x2 subplot)
%     Replicates Figure 1 from Fatima et al. (2025)
%% =========================================================

figure('Name', 'Drug Concentration Profiles', 'NumberTitle', 'off', ...
       'Position', [100, 100, 1100, 850]);

% Subplot (a) — Exact Solution
subplot(2,2,1);
yyaxis left
plot(t, Cc_exact, 'b-', 'LineWidth', 2);
ylabel('Central Compartment Concentration (mg/L)');
yyaxis right
plot(t, Cp_exact, 'r-', 'LineWidth', 2);
ylabel('Peripheral Compartment Concentration (mg/L)');
xlabel('Time (h)');
title('(a) Exact Solution');
legend('Central', 'Peripheral', 'Location', 'east');
grid on;

% Subplot (b) — Euler Method
subplot(2,2,2);
yyaxis left
plot(t, Cc_euler, 'b-', 'LineWidth', 2);
ylabel('Central Compartment Concentration (mg/L)');
yyaxis right
plot(t, Cp_euler, 'r-', 'LineWidth', 2);
ylabel('Peripheral Compartment Concentration (mg/L)');
xlabel('Time (h)');
title('(b) Euler Method');
legend('Central', 'Peripheral', 'Location', 'east');
grid on;

% Subplot (c) — Fourth-Order Runge-Kutta
subplot(2,2,3);
yyaxis left
plot(t, Cc_rk4, 'b-', 'LineWidth', 2);
ylabel('Central Compartment Concentration (mg/L)');
yyaxis right
plot(t, Cp_rk4, 'r-', 'LineWidth', 2);
ylabel('Peripheral Compartment Concentration (mg/L)');
xlabel('Time (h)');
title('(c) Fourth-Order Runge-Kutta Method');
legend('Central', 'Peripheral', 'Location', 'east');
grid on;

% Subplot (d) — Adams-Bashforth-Moulton
subplot(2,2,4);
yyaxis left
plot(t, Cc_abm, 'b-', 'LineWidth', 2);
ylabel('Central Compartment Concentration (mg/L)');
yyaxis right
plot(t, Cp_abm, 'r-', 'LineWidth', 2);
ylabel('Peripheral Compartment Concentration (mg/L)');
xlabel('Time (h)');
title('(d) Adams-Bashforth-Moulton Method');
legend('Central', 'Peripheral', 'Location', 'east');
grid on;

sgtitle('BioKinetiX | Drug Concentration Profiles — Two-Compartment Model', 'FontSize', 14, 'FontWeight', 'bold');

%% =========================================================
%  9. FIGURE 2 — ERROR COMPARISON: CENTRAL COMPARTMENT
%     Replicates Figure 2 from Fatima et al. (2025)
%% =========================================================

figure('Name', 'Error — Central Compartment', 'NumberTitle', 'off', ...
       'Position', [100, 100, 900, 500]);

plot(t, err_euler_c, 'r-o', 'LineWidth', 2, 'MarkerSize', 4); hold on;
plot(t, err_rk4_c,   'g-^', 'LineWidth', 2, 'MarkerSize', 4);
plot(t, err_abm_c,   'b-s', 'LineWidth', 2, 'MarkerSize', 4);
xlabel('Time (hours)');
ylabel('Absolute Error');
title('Error Comparison for Drug in Central Compartment');
legend("Euler's Method", 'RK4 Fourth Order Method', 'Adams-Bashforth-Moulton Method', 'Location', 'northeast');
grid on;
hold off;

%% =========================================================
%  10. FIGURE 3 — ERROR COMPARISON: PERIPHERAL COMPARTMENT
%      Replicates Figure 3 from Fatima et al. (2025)
%% =========================================================

figure('Name', 'Error — Peripheral Compartment', 'NumberTitle', 'off', ...
       'Position', [100, 100, 900, 500]);

plot(t, err_euler_p, 'r-o', 'LineWidth', 2, 'MarkerSize', 4); hold on;
plot(t, err_rk4_p,   'g-^', 'LineWidth', 2, 'MarkerSize', 4);
plot(t, err_abm_p,   'b-s', 'LineWidth', 2, 'MarkerSize', 4);
xlabel('Time (hours)');
ylabel('Absolute Error');
title('Error Comparison for Drug in Peripheral Compartment');
legend("Euler's Method", 'RK4 Fourth Order Method', 'Adams-Bashforth-Moulton Method', 'Location', 'northeast');
grid on;
hold off;

%% =========================================================
%  11. FIGURE 4 — AVERAGE ERROR BAR CHART (BOTH COMPARTMENTS)
%      Replicates Figure 4 from Fatima et al. (2025)
%% =========================================================

figure('Name', 'Average Error Bar Chart', 'NumberTitle', 'off', ...
       'Position', [100, 100, 800, 500]);

avg_errors = [avg_euler_c, avg_euler_p;
              avg_rk4_c,   avg_rk4_p;
              avg_abm_c,   avg_abm_p];

bar(avg_errors);
set(gca, 'XTickLabel', {"Euler's Method", 'Fourth Order RK Method', 'Adams-Bashforth Method'});
ylabel('Average Error');
title('Average Error of Drug Concentrations — All Methods');
legend('Central Compartment', 'Peripheral Compartment', 'Location', 'northeast');
grid on;

%% =========================================================
%  12. ORIGINAL SIMULATION — SENSITIVITY ANALYSIS
%      Effect of varying k12 on central compartment dynamics
%% =========================================================

figure('Name', 'Sensitivity Analysis: k12', 'NumberTitle', 'off', ...
       'Position', [100, 100, 900, 550]);

k12_values = [0.1, 0.3, 0.5, 0.7, 1.0];
colors = {'b', 'r', 'g', 'm', 'k'};

hold on;
for j = 1:length(k12_values)
    k12_sens = k12_values(j);
    f1_s = @(Cc, Cp) -(k12_sens + k10)*Cc + k21*Cp;
    f2_s = @(Cc, Cp)  k12_sens*Cc - k21*Cp;

    Cc_s = zeros(1, N);
    Cp_s = zeros(1, N);
    Cc_s(1) = Cc0;
    Cp_s(1) = Cp0;

    for i = 1:N-1
        Cc_v = Cc_s(i); Cp_v = Cp_s(i);
        m1 = dt * f1_s(Cc_v,        Cp_v       );
        m2 = dt * f1_s(Cc_v + m1/2, Cp_v + m1/2);
        m3 = dt * f1_s(Cc_v + m2/2, Cp_v + m2/2);
        m4 = dt * f1_s(Cc_v + m3,   Cp_v + m3  );
        l1 = dt * f2_s(Cc_v,        Cp_v       );
        l2 = dt * f2_s(Cc_v + l1/2, Cp_v + l1/2);
        l3 = dt * f2_s(Cc_v + l2/2, Cp_v + l2/2);
        l4 = dt * f2_s(Cc_v + l3,   Cp_v + l3  );
        Cc_s(i+1) = Cc_v + (m1 + 2*m2 + 2*m3 + m4)/6;
        Cp_s(i+1) = Cp_v + (l1 + 2*l2 + 2*l3 + l4)/6;
    end

    plot(t, Cc_s, colors{j}, 'LineWidth', 2, ...
         'DisplayName', sprintf('k_{12} = %.1f h^{-1}', k12_sens));
end

xlabel('Time (h)');
ylabel('Central Compartment Concentration (mg/L)');
title('BioKinetiX | Sensitivity Analysis — Effect of k_{12} on Central Compartment');
legend('Location', 'southeast');
grid on;
hold off;

%% =========================================================
%  13. ORIGINAL SIMULATION — SENSITIVITY ANALYSIS
%      Effect of varying k10 on elimination dynamics
%% =========================================================

figure('Name', 'Sensitivity Analysis: k10', 'NumberTitle', 'off', ...
       'Position', [100, 100, 900, 550]);

k10_values = [0.01, 0.05, 0.10, 0.20, 0.40];

hold on;
for j = 1:length(k10_values)
    k10_sens = k10_values(j);
    f1_s = @(Cc, Cp) -(k12 + k10_sens)*Cc + k21*Cp;
    f2_s = @(Cc, Cp)  k12*Cc - k21*Cp;

    Cc_s = zeros(1, N);
    Cp_s = zeros(1, N);
    Cc_s(1) = Cc0;
    Cp_s(1) = Cp0;

    for i = 1:N-1
        Cc_v = Cc_s(i); Cp_v = Cp_s(i);
        m1 = dt * f1_s(Cc_v,        Cp_v       );
        m2 = dt * f1_s(Cc_v + m1/2, Cp_v + m1/2);
        m3 = dt * f1_s(Cc_v + m2/2, Cp_v + m2/2);
        m4 = dt * f1_s(Cc_v + m3,   Cp_v + m3  );
        l1 = dt * f2_s(Cc_v,        Cp_v       );
        l2 = dt * f2_s(Cc_v + l1/2, Cp_v + l1/2);
        l3 = dt * f2_s(Cc_v + l2/2, Cp_v + l2/2);
        l4 = dt * f2_s(Cc_v + l3,   Cp_v + l3  );
        Cc_s(i+1) = Cc_v + (m1 + 2*m2 + 2*m3 + m4)/6;
        Cp_s(i+1) = Cp_v + (l1 + 2*l2 + 2*l3 + l4)/6;
    end

    plot(t, Cc_s, colors{j}, 'LineWidth', 2, ...
         'DisplayName', sprintf('k_{10} = %.2f h^{-1}', k10_sens));
end

xlabel('Time (h)');
ylabel('Central Compartment Concentration (mg/L)');
title('BioKinetiX | Sensitivity Analysis — Effect of k_{10} (Elimination) on Central Compartment');
legend('Location', 'southeast');
grid on;
hold off;

%% =========================================================
%  14. ORIGINAL SIMULATION — ALL METHODS ON ONE PLOT
%      Central compartment: direct visual comparison
%% =========================================================

figure('Name', 'All Methods — Central Compartment', 'NumberTitle', 'off', ...
       'Position', [100, 100, 900, 500]);

plot(t, Cc_exact, 'k-',  'LineWidth', 2.5, 'DisplayName', 'Exact Solution'); hold on;
plot(t, Cc_euler, 'r--', 'LineWidth', 1.8, 'DisplayName', "Euler's Method");
plot(t, Cc_rk4,   'g-.', 'LineWidth', 1.8, 'DisplayName', 'RK4 Method');
plot(t, Cc_abm,   'b:',  'LineWidth', 1.8, 'DisplayName', 'Adams-Bashforth-Moulton');
xlabel('Time (h)');
ylabel('Central Compartment Concentration (mg/L)');
title('BioKinetiX | Central Compartment — All Methods vs Exact Solution');
legend('Location', 'southeast');
grid on;
hold off;

fprintf('\nAll figures generated successfully.\n');
fprintf('BioKinetiX | MATH221 & CE122 Project\n');
