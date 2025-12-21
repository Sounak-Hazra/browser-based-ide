function getRunnerCommand(fileName: string, extension: string) {
    switch (extension.toLowerCase()) {
      case "js":
        return `node ${fileName}.js`;
      case "py":
        return `python3 ${fileName}.py`;
      case "java":
        return `javac ${fileName}.java && java ${fileName}`;
      case "c":
        return `gcc ${fileName}.c -o ${fileName} && ./${fileName}`;
      case "cpp":
        return `g++ ${fileName}.cpp -o ${fileName} && ./${fileName}`;
      case "ts":
        return `ts-node ${fileName}.ts`;
      case "rb":
        return `ruby ${fileName}.rb`;
      case "php":
        return `php ${fileName}.php`;
      case "go":
        return `go run ${fileName}.go`;
      case "rs":
        return `rustc ${fileName}.rs && ./${fileName}`;
      case "sh":
        return `bash ${fileName}.sh`;
      case "kt":
        return `kotlinc ${fileName}.kt -include-runtime -d ${fileName}.jar && java -jar ${fileName}.jar`;
      default:
        return `echo "Unsupported file type: ${extension}"`;
    }
  }
  