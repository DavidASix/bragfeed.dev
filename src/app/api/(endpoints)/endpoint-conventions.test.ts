import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { expect, it } from "vitest";

const endpointsDirectory = path.join(process.cwd(), "src/app/api/(endpoints)");
const endpointFiles = readdirSync(endpointsDirectory, {
  encoding: "utf8",
  recursive: true,
}).filter((file) => file.endsWith("route.ts"));

/**
 * Verifies that an external endpoint exports its input and output contracts together from the route module.
 *
 * @param relativePath - Route path relative to the external endpoints directory.
 */
function expectRouteLocalSchemas(relativePath: string) {
  const routePath = path.join(endpointsDirectory, relativePath);
  const sourceFile = ts.createSourceFile(
    routePath,
    readFileSync(routePath, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  let schemaProperties: string[] | undefined;
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    const isExported = statement.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    );
    if (!isExported) continue;

    for (const declaration of statement.declarationList.declarations) {
      if (declaration.name.getText(sourceFile) !== "schema") continue;
      if (!declaration.initializer) continue;
      if (!ts.isObjectLiteralExpression(declaration.initializer)) continue;

      schemaProperties = declaration.initializer.properties.flatMap(
        (property) =>
          "name" in property && property.name
            ? [property.name.getText(sourceFile)]
            : [],
      );
    }
  }

  expect(schemaProperties).toEqual(expect.arrayContaining(["input", "output"]));
}

/** Verifies that external endpoints do not split their contracts into standalone schema files. */
function expectNoStandaloneSchemaFiles() {
  const standaloneSchemaFiles = readdirSync(endpointsDirectory, {
    encoding: "utf8",
    recursive: true,
  }).filter((file) => path.basename(file) === "schema.ts");

  expect(standaloneSchemaFiles).toEqual([]);
}

it.each(endpointFiles)(
  "%s exports a route-local schema with input and output contracts",
  expectRouteLocalSchemas,
);
it(
  "keeps external endpoint contracts in route files",
  expectNoStandaloneSchemaFiles,
);
