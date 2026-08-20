const fs = require('fs');

function patchExpertBooking() {
  const file = 'client/src/pages/expert-booking.tsx';
  let text = fs.readFileSync(file, 'utf8');
  const bad = '  weekdays: bookingFormDefaults.weekdays,\n  startTime:';
  const good = '  weekdays: [1, 2, 3, 4, 5],\n  startTime:';
  if (!text.includes(bad)) throw new Error('Expert Booking TDZ marker not found');
  text = text.replace(bad, good);
  fs.writeFileSync(file, text);
}

function patchServerErrors() {
  const file = 'server/index.ts';
  let text = fs.readFileSync(file, 'utf8');
  const marker = '\n(async () => {\n';
  if (!text.includes(marker)) throw new Error('server/index.ts async bootstrap marker not found');

  const middleware = [
    '',
    '// Production error-response shield: never expose server internals to end users.',
    '// Route handlers may still return useful 4xx validation messages, while 5xx',
    '// responses are normalised and correlated to an internal support reference.',
    'app.use((req, res, next) => {',
    '  const originalJson = res.json.bind(res);',
    '',
    '  res.json = ((body: any) => {',
    '    if (process.env.NODE_ENV === "production" && res.statusCode >= 500) {',
    '      const existingReference = body && typeof body === "object" ? body.reference : undefined;',
    '      const reference = existingReference || ("IFVA-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 7).toUpperCase());',
    '      const publicMessage = "We couldn\'t complete that request just now. Please try again.";',
    '',
    '      res.setHeader("X-Error-Reference", reference);',
    '      console.error("[" + reference + "] " + req.method + " " + req.path + " returned " + res.statusCode, body);',
    '      return originalJson({',
    '        message: publicMessage,',
    '        error: publicMessage,',
    '        reference,',
    '      });',
    '    }',
    '',
    '    return originalJson(body);',
    '  }) as any;',
    '',
    '  next();',
    '});',
    '',
    '// Lightweight liveness endpoint used by Railway and external monitors.',
    'app.get("/health", (_req, res) => {',
    '  res.status(200).json({ status: "ok" });',
    '});',
    '',
  ].join('\n');

  if (!text.includes('Production error-response shield')) {
    text = text.replace(marker, middleware + marker);
  }

  const oldHandler = [
    '  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {',
    '    const status = err.status || err.statusCode || 500;',
    '    const message = err.message || "Internal Server Error";',
    '',
    '    res.status(status).json({ message });',
    '    throw err;',
    '  });',
  ].join('\n');

  const newHandler = [
    '  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {',
    '    const status = err.status || err.statusCode || 500;',
    '    const internalMessage = err.message || "Internal Server Error";',
    '    const reference = "IFVA-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();',
    '    const publicMessage = process.env.NODE_ENV === "production" && status >= 500',
    '      ? "We couldn\'t complete that request just now. Please try again."',
    '      : internalMessage;',
    '',
    '    console.error("[" + reference + "] Unhandled request error: " + req.method + " " + req.path, err);',
    '',
    '    if (!res.headersSent) {',
    '      res.setHeader("X-Error-Reference", reference);',
    '      res.status(status).json({',
    '        message: publicMessage,',
    '        error: publicMessage,',
    '        reference,',
    '      });',
    '    }',
    '  });',
  ].join('\n');

  if (!text.includes(oldHandler)) throw new Error('Existing global Express error handler marker not found');
  text = text.replace(oldHandler, newHandler);
  fs.writeFileSync(file, text);
}

function patchRailwayHealthcheck() {
  const file = 'railway.json';
  let text = fs.readFileSync(file, 'utf8');
  if (!text.includes('"healthcheckPath": "/"')) throw new Error('Railway healthcheck marker not found');
  text = text.replace('"healthcheckPath": "/"', '"healthcheckPath": "/health"');
  fs.writeFileSync(file, text);
}

patchExpertBooking();
patchServerErrors();
patchRailwayHealthcheck();
console.log('Applied Expert Booking TDZ, branded server error, and healthcheck fixes.');
