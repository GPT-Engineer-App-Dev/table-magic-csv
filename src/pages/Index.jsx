import React, { useState } from "react";
import Papa from "papaparse";
import { CSVLink } from "react-csv";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import * as XLSX from "xlsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [tabs, setTabs] = useState([{ id: 1, name: "Tab 1", data: [], headers: [] }]);
  const [activeTab, setActiveTab] = useState(1);
  const [newColumnName, setNewColumnName] = useState("");

  const handleFileUpload = (event, tabId) => {
    const file = event.target.files[0];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const newTabs = tabs.map(tab => {
          if (tab.id === tabId) {
            return { ...tab, data: result.data, headers: Object.keys(result.data[0]) };
          }
          return tab;
        });
        setTabs(newTabs);
      },
    });
  };

  const handleAddRow = (tabId) => {
    const newTabs = tabs.map(tab => {
      if (tab.id === tabId) {
        const newRow = tab.headers.reduce((acc, header) => {
          acc[header] = "";
          return acc;
        }, {});
        return { ...tab, data: [...tab.data, newRow] };
      }
      return tab;
    });
    setTabs(newTabs);
  };

  const handleRemoveRow = (tabId, index) => {
    const newTabs = tabs.map(tab => {
      if (tab.id === tabId) {
        const newData = tab.data.filter((_, i) => i !== index);
        return { ...tab, data: newData };
      }
      return tab;
    });
    setTabs(newTabs);
  };

  const handleCellChange = (tabId, index, header, value) => {
    const newTabs = tabs.map(tab => {
      if (tab.id === tabId) {
        const newData = [...tab.data];
        newData[index][header] = value;
        return { ...tab, data: newData };
      }
      return tab;
    });
    setTabs(newTabs);
  };

  const handleAddColumn = (tabId) => {
    if (newColumnName && !tabs.find(tab => tab.id === tabId).headers.includes(newColumnName)) {
      const newTabs = tabs.map(tab => {
        if (tab.id === tabId) {
          const newHeaders = [...tab.headers, newColumnName];
          const newData = tab.data.map(row => ({ ...row, [newColumnName]: "" }));
          return { ...tab, headers: newHeaders, data: newData };
        }
        return tab;
      });
      setTabs(newTabs);
      setNewColumnName("");
    }
  };

  const downloadExcel = (tabId) => {
    const tab = tabs.find(tab => tab.id === tabId);
    const worksheet = XLSX.utils.json_to_sheet(tab.data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `edited_data_tab_${tabId}.xlsx`);
  };

  const downloadJSON = (tabId) => {
    const tab = tabs.find(tab => tab.id === tabId);
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(tab.data)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `edited_data_tab_${tab.id}.json`;

    link.click();
  };

  const handleAddTab = () => {
    const newTabId = tabs.length + 1;
    setTabs([...tabs, { id: newTabId, name: `Tab ${newTabId}`, data: [], headers: [] }]);
    setActiveTab(newTabId);
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center space-y-4">
      <Tabs defaultValue="1" value={String(activeTab)} onValueChange={(value) => setActiveTab(Number(value))}>
        <TabsList>
          {tabs.map(tab => (
            <TabsTrigger key={tab.id} value={String(tab.id)}>
              {tab.name}
            </TabsTrigger>
          ))}
          <Button onClick={handleAddTab}>Add Tab</Button>
        </TabsList>
        {tabs.map(tab => (
          <TabsContent key={tab.id} value={String(tab.id)}>
            <Input type="file" accept=".csv" onChange={(e) => handleFileUpload(e, tab.id)} />
            {tab.data.length > 0 && (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {tab.headers.map((header) => (
                        <TableHead key={header}>{header}</TableHead>
                      ))}
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tab.data.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {tab.headers.map((header) => (
                          <TableCell key={header}>
                            <Input
                              value={row[header]}
                              onChange={(e) =>
                                handleCellChange(tab.id, rowIndex, header, e.target.value)
                              }
                            />
                          </TableCell>
                        ))}
                        <TableCell>
                          <Button variant="destructive" onClick={() => handleRemoveRow(tab.id, rowIndex)}>
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
                  <Button onClick={() => handleAddColumn(tab.id)}>Add Column</Button>
                </div>
                <Button onClick={() => handleAddRow(tab.id)}>Add Row</Button>
                <CSVLink data={tab.data} headers={tab.headers} filename={`edited_data_tab_${tab.id}.csv`}>
                  <Button>Download CSV</Button>
                </CSVLink>
                <Button onClick={() => downloadExcel(tab.id)}>Download Excel</Button>
                <Button onClick={() => downloadJSON(tab.id)}>Download JSON</Button>
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Index;