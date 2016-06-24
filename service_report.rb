require "csv"
require "active_support"
require 'active_support/core_ext'
require "pp"

(1..30).each do |ward|
  summary = Hash.new { |h,k| h[k] = { :opened => 0, :closed => 0} }

  CSV.foreach("scf-data.csv", :headers => true) do |e| 
    next unless e["request_type_id"] == "117" && e["ward"] == ward.to_s

    if e["created_at"].present?
      summary[Date.parse(e["created_at"]).monday][:opened] += 1 
    end

    if e["closed_at"].present?
      summary[Date.parse(e["closed_at"]).monday][:closed] += 1 
    end
  end

  week   = Date.parse("2010-01-01").monday
  finish = Date.parse("2016-06-01").monday

  ward_csv = File.open("sidewalks-#{ward}.csv", "w")

  ward_csv.puts "week,opened,closed"

  while week < finish
    summary[week][:opened] += summary[week - 7][:opened]
    summary[week][:closed] += summary[week - 7][:closed]

    ward_csv.puts [week, summary[week][:opened], summary[week][:closed]].to_csv
    week += 7
  end

  ward_csv.close
end
