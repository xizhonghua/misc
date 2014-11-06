#!/usr/bin/env octave -qf

r = load('result.txt');

figure ('visible', 'off'); 

h = scatter(r(:,1), r(:,2));

axis([1 1e10 1 1e10]);
set(gca, 'YScale', 'log');
set(gca, 'XScale', 'log');

xlabel('X');
ylabel('Google(X)');

grid on;

print('-depsc', 'google-num');

exit(0);