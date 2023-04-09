import dayjs from "dayjs";
import { parseCookies } from "nookies";
import React, { useState } from "react";
import Datepicker from "react-tailwindcss-datepicker";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell } from "recharts";
import Header from "~/components/Header";
import FullScreenWrapper from "~/components/wrappers/FullScreenWrapper";
import { api } from "~/utils/api";
import { analyticsOutput } from "~/utils/types";
function getTotalExpensesValuesByCategory(
  collection: analyticsOutput["expenses"]
): {
  [category: string | number]: number;
} {
  return collection.reduce((result, item) => {
    if (result[item.category]) {
      result[item.category] += item.value;
    } else {
      result[item.category] = item.value;
    }
    return result;
  }, {} as { [category: string | number]: number });
}
function getTotalExpensesValuesByMethod(
  collection: analyticsOutput["expenses"]
): {
  [method: string | number]: number;
} {
  return collection.reduce((result, item) => {
    if (result[item.method]) {
      result[item.method] += item.value;
    } else {
      result[item.method] = item.value;
    }
    return result;
  }, {} as { [method: string | number]: number });
}
function getTotalExpenses(expensesArr: analyticsOutput["expenses"]) {
  return expensesArr.reduce((result, item) => {
    if (item.value) {
      result += item.value;
    } else {
      result = item.value;
    }
    return result;
  }, 0);
}
function getTotalEarnings(earningsArr: analyticsOutput["earnings"]) {
  return earningsArr.reduce((result, item) => {
    if (item.value) {
      result += item.value;
    } else {
      result = item.value;
    }
    return result;
  }, 0);
}
function joinTransactionAndOrderByDate(
  earningsArr: analyticsOutput["earnings"],
  expensesArr: analyticsOutput["expenses"]
) {
  let formattedEarnings = [...earningsArr].map((item) => {
    return {
      name: item.description,
      value: item.value,
      date: item.date,
    };
  });
  let formattedExpenses = [...expensesArr].map((item) => {
    return {
      name: item.description,
      value: -item.value,
      date: item.paymentDate,
    };
  });
  let newArr: { name: string; value: number; date: Date }[] =
    formattedEarnings.concat(formattedExpenses);
  newArr = newArr.sort((a, b) => {
    return b.date.getTime() - a.date.getTime();
  });
  return newArr;
}

const date = new Date();
const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#ff006e",
  "#8338ec",
  "#9a031e",
  "#ff758f",
];

function Analytics() {
  const [period, setPeriod] = useState({
    startDate: firstDay,
    endDate: lastDay,
  });
  var { userId } = parseCookies(null);
  const { data: user, isLoading: userLoading } = api.users.getUser.useQuery(
    userId ? userId : ""
  );
  const { data } = api.finances.getAnalytics.useQuery(
    {
      id: user ? user.id : "",
      startDate: period.startDate,
      endDate: period.endDate,
    },
    { enabled: !!user }
  );
  return (
    <FullScreenWrapper>
      <Header />
      <div className="flex w-full grow flex-col bg-[#f8f9fa] p-6">
        <div className="mb-2 flex flex-col items-center lg:flex-row lg:justify-between">
          <div className="mb-4 flex flex-col items-start">
            <h1 className="w-full text-center text-xl font-bold lg:text-start">
              Olá,{" "}
              <strong className="text-[#2790b0]">
                {user?.name ? user.name : "..."}
              </strong>{" "}
              !
            </h1>
            <p className="w-full text-center text-sm text-gray-500 lg:text-start">
              Aqui você pode visualizar um relatório das suas finanças no
              período desejado.
            </p>
          </div>
          <div className="flex w-full flex-col items-end lg:w-fit">
            <Datepicker
              i18n="pt-br"
              placeholder={"Selecione um período"}
              displayFormat={"DD/MM/YYYY"}
              primaryColor={"green"}
              configs={{
                shortcuts: {
                  today: "TText",
                  yesterday: "YText",
                  past: (period) => `P-${period} Text`,
                  currentMonth: "CMText",
                  pastMonth: "PMText",
                },
                footer: {
                  cancel: "CText",
                  apply: "AText",
                },
              }}
              value={period}
              onChange={(value) => {
                setPeriod({
                  startDate: value
                    ? dayjs(value.startDate).add(3, "hours").toDate()
                    : firstDay,
                  endDate: value
                    ? dayjs(value.endDate).add(4, "hours").toDate()
                    : lastDay,
                });
              }}
            />
          </div>
        </div>
        <div className="flex grow flex-col gap-4 rounded-xl bg-[#80ed99] p-6 ">
          <div className="grid grid-cols-1 grid-rows-3 gap-3 lg:grid-cols-3 lg:grid-rows-1">
            <div className="flex h-[350px] w-full flex-col rounded-md border border-gray-100 bg-[#fff] p-2 shadow-lg">
              <h1 className="w-full text-center text-2xl font-medium text-[#0088FE]">
                BALANÇO NO PERÍODO
              </h1>
              <div className="flex grow items-center justify-center">
                {data?.earnings && data.expenses ? (
                  <p
                    className={`${
                      getTotalEarnings(data?.earnings) -
                        getTotalExpenses(data?.expenses) >
                      0
                        ? "text-green-500"
                        : "text-[#ff0054]"
                    } font-medium`}
                  >
                    R${" "}
                    <strong className="text-4xl">
                      {(
                        getTotalEarnings(data?.earnings) -
                        getTotalExpenses(data?.expenses)
                      ).toLocaleString("pt-br", {
                        minimumFractionDigits: 2,
                      })}
                    </strong>
                  </p>
                ) : (
                  <p className="animate-pulse text-center text-4xl text-gray-300">
                    ...
                  </p>
                )}
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <p className="text-xl font-medium text-[#4e4d4a]">GANHOS</p>
                  {data?.earnings ? (
                    <p className="text-xl font-medium text-green-500">
                      {getTotalEarnings(data.earnings).toLocaleString("pt-br", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  ) : (
                    <p className="animate-pulse text-center text-xl text-gray-300">
                      ...
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-medium text-[#4e4d4a]">GASTOS</p>
                  {data?.expenses ? (
                    <p className="text-xl font-medium text-[#ff0054]">
                      R${" "}
                      {getTotalExpenses(data.expenses).toLocaleString("pt-br", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  ) : (
                    <p className="animate-pulse text-center text-xl text-gray-300">
                      ...
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex h-[350px] w-full flex-col rounded-md border border-gray-100 bg-[#fff] p-2 shadow-lg">
              <h1 className="w-full text-center text-2xl font-medium text-[#0088FE]">
                GASTO POR CATEGORIA
              </h1>
              <div className="w-full grow">
                {data?.expenses ? (
                  <ResponsiveContainer width={"100%"}>
                    <PieChart>
                      {/* <Legend verticalAlign="top" height={36} /> */}
                      <Tooltip />
                      <Pie
                        data={Object.entries(
                          getTotalExpensesValuesByCategory(
                            data?.expenses ? data.expenses : []
                          )
                        ).map(([category, value]) => {
                          return {
                            category: category,
                            value: Number(value.toFixed(2)),
                          };
                        })}
                        dataKey="value"
                        nameKey="category"
                        outerRadius={70}
                        label={({
                          cx,
                          cy,
                          midAngle,
                          innerRadius,
                          outerRadius,
                          value,
                          index,
                        }) => {
                          const RADIAN = Math.PI / 180;
                          // eslint-disable-next-line
                          const radius =
                            25 + innerRadius + (outerRadius - innerRadius);
                          // eslint-disable-next-line
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          // eslint-disable-next-line
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          const category = Object.entries(
                            getTotalExpensesValuesByCategory(
                              data?.expenses ? data.expenses : []
                            )
                          ).map(([category, value]) => {
                            return {
                              category: category,
                              value: Number(value.toFixed(2)),
                            };
                          })[index]?.category;
                          return (
                            <text
                              y={y}
                              x={x}
                              fill={COLORS[index % COLORS.length]}
                              textAnchor={x > cx ? "start" : "end"}
                              dominantBaseline={"central"}
                              style={{ fontSize: "12px", fontWeight: "bold" }}
                            >
                              {category} (R${value})
                            </text>
                          );
                        }}
                      >
                        {Object.entries(
                          getTotalExpensesValuesByCategory(
                            data?.expenses ? data.expenses : []
                          )
                        )
                          .map(([category, value]) => {
                            return {
                              category: category,
                              value: Number(value.toFixed(2)),
                            };
                          })
                          .map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
            <div className="flex h-[350px] w-full flex-col rounded-md border border-gray-100 bg-[#fff] p-2 shadow-lg">
              <h1 className="w-full text-center text-2xl font-medium text-[#0088FE]">
                GASTO POR MÉTODO
              </h1>
              <div className="w-full grow">
                {data?.expenses ? (
                  <ResponsiveContainer width={"100%"}>
                    <PieChart>
                      {/* <Legend verticalAlign="top" height={36} /> */}
                      <Tooltip />
                      <Pie
                        data={Object.entries(
                          getTotalExpensesValuesByMethod(
                            data?.expenses ? data.expenses : []
                          )
                        ).map(([method, value]) => {
                          return {
                            method: method,
                            value: Number(value.toFixed(2)),
                          };
                        })}
                        dataKey="value"
                        nameKey="method"
                        outerRadius={70}
                        label={({
                          cx,
                          cy,
                          midAngle,
                          innerRadius,
                          outerRadius,
                          value,
                          index,
                        }) => {
                          const RADIAN = Math.PI / 180;
                          // eslint-disable-next-line
                          const radius =
                            25 + innerRadius + (outerRadius - innerRadius);
                          // eslint-disable-next-line
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          // eslint-disable-next-line
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          const method = Object.entries(
                            getTotalExpensesValuesByMethod(
                              data?.expenses ? data.expenses : []
                            )
                          ).map(([method, value]) => {
                            return {
                              method: method,
                              value: Number(value.toFixed(2)),
                            };
                          })[index]?.method;
                          return (
                            <text
                              y={y}
                              x={x}
                              fill={COLORS[index % COLORS.length]}
                              textAnchor={x > cx ? "start" : "end"}
                              dominantBaseline={"central"}
                              style={{ fontSize: "12px", fontWeight: "bold" }}
                            >
                              {method} (R${value})
                            </text>
                          );
                        }}
                      >
                        {Object.entries(
                          getTotalExpensesValuesByMethod(
                            data?.expenses ? data.expenses : []
                          )
                        )
                          .map(([method, value]) => {
                            return {
                              method: method,
                              value: Number(value.toFixed(2)),
                            };
                          })
                          .map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center justify-around gap-4">
            {data?.earnings && data.expenses
              ? joinTransactionAndOrderByDate(data.earnings, data.expenses).map(
                  (item) => (
                    <div className="flex h-[100px] w-[200px] flex-col rounded-md border border-gray-100 bg-[#fff] p-2 shadow-lg">
                      <h1 className="w-full text-start text-xs font-medium">
                        {item.name}
                      </h1>
                      <div className="flex grow items-center justify-center">
                        <h1
                          className={`w-full  text-center ${
                            item.value > 0 ? "text-green-500" : "text-[#ff0054]"
                          } font-medium`}
                        >
                          R$
                          {item.value.toLocaleString("pt-br", {
                            minimumFractionDigits: 2,
                          })}
                        </h1>
                      </div>

                      <h1 className="w-full text-start text-xs font-thin">
                        {item.date.toLocaleDateString()}
                      </h1>
                    </div>
                  )
                )
              : null}
            {/* <div className="h-[100px] w-[200px] rounded-md border border-gray-100 bg-[#fff] p-2 shadow-lg"></div>
            <div className="h-[100px] w-[200px] rounded-md border border-gray-100 bg-[#fff] p-2 shadow-lg"></div>
            <div className="h-[100px] w-[200px] rounded-md border border-gray-100 bg-[#fff] p-2 shadow-lg"></div>
            <div className="h-[100px] w-[200px] rounded-md border border-gray-100 bg-[#fff] p-2 shadow-lg"></div>
            <div className="h-[100px] w-[200px] rounded-md border border-gray-100 bg-[#fff] p-2 shadow-lg"></div>
            <div className="h-[100px] w-[200px] rounded-md border border-gray-100 bg-[#fff] p-2 shadow-lg"></div>
            <div className="h-[100px] w-[200px] rounded-md border border-gray-100 bg-[#fff] p-2 shadow-lg"></div>
            <div className="h-[100px] w-[200px] rounded-md border border-gray-100 bg-[#fff] p-2 shadow-lg"></div> */}
          </div>
          {/* <div className="h-[250px] w-full rounded-md border border-gray-100 bg-[#fff] p-2 shadow-lg"></div> */}
        </div>
      </div>
    </FullScreenWrapper>
  );
}

export default Analytics;
