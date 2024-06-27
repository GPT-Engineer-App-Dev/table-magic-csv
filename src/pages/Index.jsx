import React, { useState } from "react";
import Papa from "papaparse";
import { CSVLink } from "react-csv";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as XLSX from "xlsx";

const Index = () => {
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [newColumnName, setNewColumnName] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setHeaders(Object.keys(result.data[0]));
        setCsvData(result.data);
      },
    });
  };

  const handleAddRow = () => {
    const newRow = headers.reduce((acc, header) => {
      acc[header] = "";
      return acc;
    }, {});
    setCsvData([...csvData, newRow]);
  };

  const handleRemoveRow = (index) => {
    const newData = csvData.filter((_, i) => i !== index);
    setCsvData(newData);
  };

  const handleCellChange = (index, header, value) => {
    const newData = [...csvData];
    newData[index][header] = value;
    setCsvData(newData);
  };

  const handleAddColumn = () => {
    if (newColumnName && !headers.includes(newColumnName)) {
      setHeaders([...headers, newColumnName]);
      const newData = csvData.map(row => ({ ...row, [newColumnName]: "" }));
      setCsvData(newData);
      setNewColumnName("");
    }
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(csvData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "edited_data.xlsx");
  };

  const downloadJSON = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(csvData)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "edited_data.json";

    link.click();
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center space-y-4">
      <Input type="file" accept=".csv" onChange={handleFileUpload} />
      {csvData.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {csvData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {headers.map((header) => (
                    <TableCell key={header}>
                      <Input
                        value={row[header]}
                        onChange={(e) =>
                          handleCellChange(rowIndex, header, e.target.value)
                        }
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button variant="destructive" onClick={() => handleRemoveRow(rowIndex)}>
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="New column name"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
            />
            <Button onClick={handleAddColumn}>Add Column</Button>
          </div>
          <Button onClick={handleAddRow}>Add Row</Button>
          <CSVLink data={csvData} headers={headers} filename={"edited_data.csv"}>
            <Button>Download CSV</Button>
          </CSVLink>
          <Button onClick={downloadExcel}>Download Excel</Button>
          <Button onClick={downloadJSON}>Download JSON</Button>
        </>
      )}
    </div>
  );
};

export default Index;