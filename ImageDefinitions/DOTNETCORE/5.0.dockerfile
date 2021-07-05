FROM mcr.microsoft.com/dotnet/runtime:5.0 AS base
WORKDIR /app

FROM mcr.microsoft.com/dotnet/sdk:5.0 AS build
WORKDIR /src
COPY . .
WORKDIR "./%ProjectName%"
RUN ls -l
RUN dotnet build "%ProjectName%.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "%ProjectName%.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app/run
COPY --from=publish /app/publish .
RUN cp /usr/share/zoneinfo/Europe/Istanbul /etc/localtime
ENTRYPOINT ["dotnet", "%ProjectName%.dll"]